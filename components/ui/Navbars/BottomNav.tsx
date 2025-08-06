"use client";

import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import useScrollingDirection from "@/src/Utils/Hooks/useScrollingDirection";
import Home from "@/components/Icons/Home";
import Search from "@/components/Icons/search";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import Heart from "@/components/Icons/heart";
import Mail from "@/components/Icons/Mail";
import Scissors from "../../Icons/Scissors";
import { createSignal, onMount, Show } from "solid-js";
import { api } from "@/src";
import useDevice from "@/src/Utils/Hooks/useDevice";
import { haptic } from "@/src/Utils/SDK";

export default function BottomNav() {
  const { theme } = useTheme();
  const { route, navigate } = useNavigation();
  const [hide, setHide] = createSignal(false);
  const { scrollingDirection } = useScrollingDirection();
  const { mobile } = useDevice();

  onMount(() => {
    //@ts-ignore
    window.hideBottomNav = () => {
      setHide(true);
    };

    window.showBottomNav = () => {
      setHide(false);
    };
  });

  return (
    <div
      class={joinClass(
        "fixed bottom-[-2px] sm:bottom-[0px] z-[999999] w-full",
        "xl:hidden lg:hidden 2xl:hidden",
        hide() && mobile() ? "hidden" : "",
      )}
    >
      <Show
        when={
          !window.location.pathname.includes("/settings") &&
          !window.location.pathname.includes("/snippets") &&
          !window.location.pathname.includes("/bookmarks") &&
          api.authStore.model.username
        }
      >
        <div
          class={joinClass(
            "btn btn-circle border-none btn-xl fixed bottom-24 right-3 rounded-2xl",
            scrollingDirection() == "down"
              ? "bg-opacity-50"
              : scrollingDirection() == "up"
                ? "bg-opacity-100"
                : "bg-opacity-100",
            theme() == "dark" ? "bg-white text-black" : "bg-black text-white",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            class={joinClass(
              " size-6",
              theme() == "dark" ? "fill-black" : "fill-white",
            )}
            onClick={() => {
              //@ts-ignore
              if (api.authStore.model.username) {
                document.getElementById("createPostModal")?.showModal();
                //@ts-ignore
                window.resetCreatePost();
                //@ts-ignore
                window.modal = "comments";
              } else {
                requireSignup(); // Use requireSignup
              }
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
      </Show>

      <ul
        class={joinClass(
          "flex justify-between p-5 h-full bg[#121212] border border-l-0 border-b-0 border-r-0 rounded-t-3xl",
          theme() === "dark"
            ? "text-white fill-white stroke-white bg-black border-t-[#53535322]"
            : "bg-white border-t-[#e0e0e0]",
          scrollingDirection() == "down"
            ? "bg-opacity-50"
            : scrollingDirection() == "up"
              ? "bg-opacity-100"
              : "bg-opacity-100",
        )}
      >
        <li class="flex mb-5 ">
          <Home
            class={joinClass(
              "w-7 h-7",
              route() == "/"
                ? theme() == "dark"
                  ? "fill-white"
                  : "fill-black"
                : "opacity-50",
            )}
            onClick={() => {
              navigate("/");
              haptic();
            }}
          />
        </li>
        <li class="flex mb-5 ">
          <Search
            onClick={() => {
              navigate("/explore");
              haptic();
            }}
            class={joinClass(
              "w-7 h-7",
              route() === "/explore"
                ? theme() == "dark"
                  ? "text-white"
                  : "text-black"
                : "opacity-50",
            )}
          />
        </li>
        <li class="flex mb-5 ">
          <Mail
            class={joinClass(
              "w-7 h-7",
              route() === "/messages"
                ? theme() == "dark"
                  ? "fill-white"
                  : "fill-black"
                : "opacity-50",
            )}
          />
        </li>
        <li class="flex mb-5 ">
          <Heart
            class={joinClass(
              "w-7 h-7",
              route() === "/notifications"
                ? theme() == "dark"
                  ? "fill-white"
                  : "fill-black"
                : "opacity-50",
            )}
          />
        </li>
        <li class="flex mb-5 ">
          <Scissors
            onClick={() => {
              navigate("/snippets");
              haptic();
            }}
            class={joinClass(
              "w-7 h-7",
              route() === "/snippets"
                ? theme() == "dark"
                  ? "fill-white"
                  : "text-black"
                : "opacity-50",
            )}
          />
        </li>
      </ul>
    </div>
  );
}
