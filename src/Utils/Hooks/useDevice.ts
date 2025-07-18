import { createSignal, onMount, onCleanup } from "solid-js";

function checker() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTabletUA = /iPad|Android|tablet/i.test(userAgent);
  const isDesktopUA = !isMobileUA && !isTabletUA;

  return { isMobileUA, isTabletUA, isDesktopUA };
}

export default function useDevice(options?: {
  widthThreshold?: number; // e.g. 768
  heightThreshold?: number; // e.g. 800
  useHeightInsteadOfWidth?: boolean; // default false
}) {
  const { widthThreshold = 768, heightThreshold = 800, useHeightInsteadOfWidth = false } = options || {};

  const [mobile, setMobile] = createSignal(false);
  const [tablet, setTablet] = createSignal(false);
  const [desktop, setDesktop] = createSignal(false);

  function updateDevice() {
    const { isMobileUA, isTabletUA, isDesktopUA } = checker();

    // Screen size based detection
    const dimension = useHeightInsteadOfWidth ? window.innerHeight : window.innerWidth;

    let isMobileScreen = dimension < widthThreshold;
    let isTabletScreen = dimension >= widthThreshold && dimension < heightThreshold;
    let isDesktopScreen = dimension >= heightThreshold;

    // Decide final device type — prioritize screen size detection over UA, but fallback to UA if needed
    setMobile(isMobileScreen || isMobileUA);
    setTablet(isTabletScreen || isTabletUA);
    setDesktop(isDesktopScreen || isDesktopUA);
  }

  onMount(() => {
    updateDevice();
    window.addEventListener("resize", updateDevice);
    onCleanup(() => window.removeEventListener("resize", updateDevice));
  });

  return { mobile, tablet, desktop };
}
