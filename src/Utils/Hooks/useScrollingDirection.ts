import { createEffect, createSignal, onCleanup } from "solid-js";

export default function useScrollingDirection() {
  const [scrollingDirection, setScrollingDirection] = createSignal("up", { equals: false });
  const [lastScroll, setLastScroll] = createSignal(0);
  let timeoutId;

  createEffect(() => {
    const onScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;

      // Clear previous timeout if scrolling continues
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a timeout to detect the direction after 1 second
      timeoutId = setTimeout(() => {
        if (st > lastScroll()) {
          setScrollingDirection("down");
        } else {
          setScrollingDirection("up");
        }
        setLastScroll(st);
      }, 10); // Delay in milliseconds
    };

    window.onscrollend = () => {
        var t = setTimeout(()=>{
           setScrollingDirection("up")
           clearTimeout(t)
        }, 1000)
    }

    window.addEventListener("scroll", onScroll);

    onCleanup(() => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  });

  return { scrollingDirection };
}
