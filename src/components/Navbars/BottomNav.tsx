import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import useScrollingDirection from "@/src/Utils/Hooks/useScrollingDirection";
import Home from "../Icons/Home";
import Search from "../Icons/search";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import Heart from "../Icons/heart";
import Mail from "../Icons/Mail";
import Scissors from "../Icons/Scissors";
import { createEffect, createSignal } from "solid-js";
import { api } from "@/src";

export default function BottomNav() {
  const { theme } = useTheme();
  const { route, navigate } = useNavigation();
  const { scrollingDirection } = useScrollingDirection()
  return (
    <div
      class={joinClass(
        "fixed bottom-[-2px] sm:bottom-[0px]  z-[999999] w-full", 
        "xl:hidden lg:hidden 2xl:hidden",
      )}
    >
        <div class={joinClass("btn btn-circle btn-xl bg-blue-500 fixed bottom-24 right-3", scrollingDirection() == "down" ? "bg-opacity-50" : 
        scrollingDirection() == "up" ? "bg-opacity-100" : "bg-opacity-100", 
        )}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="fill-white stroke-white size-6" onClick={() =>{
            //@ts-ignore   
          if(api.authStore.model.id){
            document.getElementById("createPostModal")?.showModal()
           //@ts-ignore
           window.resetCreatePost()
           //@ts-ignore   
           window.modal = "comments" 
          }else{
            document.getElementById("register").showModal()
          }
            
        }}>
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>

        </div>
      <ul
        class={joinClass(
          " flex justify-between p-5   h-full bg[#121212]   border border-l-0 border-b-0 border-r-0",
          theme() === "dark"
            ? "text-white fill-white stroke-white bg-black border-t-[#53535322]"
            : "bg-white border-t-[#e0e0e0]",
            scrollingDirection() == "down" ? "bg-opacity-50" : 
            scrollingDirection() == "up" ? "bg-opacity-100" : "bg-opacity-100", 
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
                : "opacity-50"
            )}
            onClick={() => navigate("/")}
          />
        </li>
        <li class="flex mb-5 ">
          <Search
            class={joinClass(
              "w-7 h-7",
              route() === "/explore"
                ? theme() == "dark"
                  ? "fill-white"
                  : "fill-black"
                : "opacity-50"
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
                : "opacity-50"
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
                : "opacity-50"
            )}
          />
        </li>
        <li class="flex mb-5 ">
          <Scissors
            class={joinClass(
              "w-7 h-7",
              route() === "/create"
                ? theme() == "dark"
                  ? "fill-white"
                  : "fill-black"
                : "opacity-50"
            )}
          />
        </li>
      </ul>
    </div>
  );
}
