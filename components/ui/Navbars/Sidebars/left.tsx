import { api } from "@/src";
import logo from "@/src/assets/icon_transparent.png";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import Home from "../../../Icons/Home";
import Dropdown, {
  DropdownHeader,
  DropdownItem,
} from "@/components/UX/dropdown";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import { Portal } from "solid-js/web";
import { haptic } from "@/src/Utils/SDK";
import Bookmark from "../../../Icons/Bookmark";
import Search from "../../../Icons/search";
import Settings from "../../../Icons/Settings";
import Mail from "../../../Icons/Mail";
import Scissors from "../../../Icons/Scissors";
import Heart from "../../../Icons/heart";
import { createSignal, Show } from "solid-js";
export function SideBarLeft(props: {
  params: () => any;
  route: () => string;
  navigate: any;
}) {
  const error = false;
  let { theme } = useTheme();
  const { route, navigate } = useNavigation();
  const [isCollapsed, setIsCollapsed] = createSignal(false);
  
  const navigationItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Snippets", path: "/snippets", icon: Scissors },
    { name: "Notifications", path: "/notifications", icon: Heart },
    { name: "Messages", path: "/messages", icon: Mail },
    { name: "Bookmarks", path: "/bookmarks", icon: Bookmark },
    { name: "Profile", path: api.authStore.model?.username ? `/u/${api.authStore.model.username}` : "/auth/login", icon: Settings },
  ];

  return (
    <>
      <div class="xl:drawer xl:w-auto md:p-2 mr-5 xl:drawer-open lg:drawer-open">
        <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
        {error ? (
          <div class="toast toast-end">
            <div class="alert bg-red-500 bg-opacity-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width={1.5}
                stroke="currentColor"
                class="text-rose-500 w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
          </div>
        ) : (
          ""
        )}
        <div>
          <label aria-label="close sidebar" class="drawer-overlay"></label>
          <div class="menu w-64 flex flex-col min-h-full text-base-content bg-base-100">
            {/* Logo Section */}
            <div class="p-4 mb-2">
              <a href="/" class="flex items-center gap-3 hover:bg-transparent">
                <img
                  src={logo}
                  class={joinClass(
                    "rounded w-18 h-18 transition-transform hover:scale-105",
                    theme() == "light" && "filter brightness-0",
                  )}
                  width={40}
                  alt="Postly Logo"
                />
                
              </a>
            </div>

            {/* User Profile Section */}
            

            {/* Navigation Items */}
            <ul class="flex-1 gap-12 px-2 space-y-6">
              {navigationItems.map((item) => (
                <li class="">
                  <a
                    href={item.path}
                    class={joinClass(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-base-200",
                      "text-base font-medium",
                      route() === item.path
                        ? "bg-blue-500/10 text-blue-500 font-semibold"
                        : theme() === "dark"
                        ? "text-base-content/90 hover:text-base-content"
                        : "text-base-content/80 hover:text-base-content"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                  >
                    <item.icon class="w-6 h-6 flex-shrink-0" />
                    <span class="hidden xl:block">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
           
                        {/* Post Button */}
            <div class="p-4 mt-auto">
              <button
                onClick={() => {
                  if (api.authStore.model.id) {
                    //@ts-ignore
                    document.getElementById("createPostModal").showModal();
                    //@ts-ignore
                  } else {
                    //@ts-ignore
                    requireSignup();
                  }
                }}
                class={joinClass(
                  "w-full rounded-full text-sm p-5 font-semibold transition-all duration-200",
                  "bg-blue-500 hover:bg-blue-600 text-white",
                  "hover:shadow-lg hover:scale-105 active:scale-95",
                  "flex items-center justify-center gap-2 py-3"
                )}
              >
                {api.authStore.model.id && (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width={2}
                      stroke="currentColor"
                      class="w-5 h-5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <span class="hidden xl:block">
                      {window.location.pathname.includes("/view")
                        ? "Create Comment"
                        : "Post"}
                    </span>
                  </>
                )}
                {!api.authStore.model.id && (
                  <>
                    <span   >Join The Community!</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width={2}
                      stroke="currentColor"
                      class="w-5 h-5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
