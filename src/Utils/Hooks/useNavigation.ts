import { createSignal } from "solid-js";

let currentRoute = "/";
const arrayOfNavigations = createSignal<string[]>([currentRoute]);
let params = [{ route: "/", params: null }] as [{ route: string; params: any }];

export default function useNavigation($route?: string, $params?: any) {
  const [route, setRoute] = createSignal(
    new URL(window.location.href).pathname || "/"
  );
  const [_params, setParams] = createSignal(
    params.find((p) => p.route === currentRoute)?.params || null
  );

  const searchParams = new URL(window.location.href).searchParams;

  const parseParams = (route: string) => {
    const paramNames = route
      .split("/")
      .filter((part) => part.startsWith(":"))
      .map((part) => part.slice(1));
    const paramValues = new URL(window.location.href).pathname
      .split("/")
      .slice(2)
      .filter((part) => !part.startsWith(":"));
    const parsedParams = paramNames.reduce((acc, paramName, index) => {
      acc[paramName] = paramValues[index];
      return acc;
    }, {} as any);
    return parsedParams;
  };

  if ($route && $route.includes(":")) {
    const $_params = parseParams($route);
    setParams<{}>($_params);
  }

  // Flag to know if popstate was manually dispatched from navigate()
  let manualNavigation = false;

  const navigate = (route: string, $params?: any) => {
    if ($params) {
      params.push({ route, params: $params });
      setParams($params);
    }
    setRoute(route);
    currentRoute = route;
    arrayOfNavigations.push(route);
    window.history.pushState(null, "", route);

    manualNavigation = true; // Mark manual dispatch
    window.dispatchEvent(new Event("popstate"));
  };

  window.addEventListener("popstate", () => {
    if (manualNavigation) {
      manualNavigation = false; // reset flag
      // Ignore the popstate event triggered manually by navigate()
      return;
    }
    // Handle real browser back/forward events here
    console.log("route change");
    const path = new URL(window.location.href).pathname;
    setRoute(path);
    const matchingParams = params.find((p) => p.route === path)?.params || null;
    setParams(matchingParams);
    currentRoute = path;
  });

  const goBack = () => {
    const index = arrayOfNavigations.indexOf(currentRoute);
    if (index === 0) return;
    currentRoute = arrayOfNavigations[index - 1];
    setRoute(currentRoute);
    window.history.back();
    // No manual popstate dispatch here: browser triggers it naturally
  };

  const goForward = () => {
    const index = arrayOfNavigations.indexOf(currentRoute);
    if (index === arrayOfNavigations.length - 1) return;
    currentRoute = arrayOfNavigations[index + 1];
    setRoute(currentRoute);
    window.history.forward();
    // No manual popstate dispatch here either
  };

  return { route, navigate, goBack, goForward, params: _params, searchParams };
}
