import useTheme from "../../Utils/Hooks/useTheme";
import { api } from "../..";
import { joinClass } from "@/src/Utils/Joinclass";
import { Accessor, Show } from "solid-js";
import logo from "@/src/assets/icon_transparent.png";
import { createSignal, createEffect } from "solid-js";
import useScrollingDirection from "@/src/Utils/Hooks/useScrollingDirection";
import useDevice from "@/src/Utils/Hooks/useDevice";
import { Portal } from "solid-js/web";
import Modal from "../Modal";
import MobileSidebar from "../Modals/MobileSidebar";
import Bookmark from "../Icons/Bookmark";
import Settings from "../Icons/Settings";
import LogoutModal from "@/src/Utils/Modals/LogoutModal";
export default function HomeNav({
  navigate,
  page,
  swapFeed,
}: {
  navigate: any;
  page: Accessor<string>;
  swapFeed: any;
}) {
  const { theme } = useTheme();
  let { scrollingDirection } = useScrollingDirection();
  let { mobile } = useDevice();
 
  return (
    <div
      class={joinClass(
        "flex flex-col sticky top-0 sm:p-0 md:p-4 z-[9999]",
        theme() === "dark"
          ? "bg-black z-[99999] text-white border-[#121212] border border-l-0 border-r-0 border-b-none"
          : "bg-white border border-[#f3f3f3]",
        "backdrop-blur-sm",
        mobile() && scrollingDirection() === "down" ? "hidden" : ""
      )}
    >  
      <div class="flex   w-full sm:p-3  z-[9999999] justify-between ">
                <div class="flex gap-2 hero">
                  <div class="flex flex-col   w-full">
                    <div class="flex  justify-between gap-2 w-full">
                      <div class="flex flex-row  gap-2  ">
                        <div class="dropdown     ">
                          <label tabIndex={0}>
                            {typeof window != "undefined"  ? (
                              <>
                                {api.authStore.model?.avatar ? (
                                  <img
                                    src={api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar)}
                                    alt={api.authStore.model.username}
                                    class="rounded object-cover w-12 h-12 cursor-pointer"
                                  ></img>
                                ) : (
                                  <div class="avatar placeholder">
                                  <div class="bg-base-300 text-black   avatar  w-16 h-16   border cursor-pointer rounded   border-white">
                                    <span class="text-2xl">
                                      {api.authStore.model.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                )}
                              </>
                            ) : (
                              ""
                            )}
                          </label>
                          <ul
                            tabIndex={0}
                            style={{
                               border: theme() === 'dark' ? '1px solid #2d2d2d' : '1px solid #f9f9f9',
                               "border-radius": '10px'
                            }}
                            class="dropdown-content  menu   w-[16rem] shadow bg-base-100  rounded "
                          >
                            <li>
                              <a
                                onClick={() => {
                                  navigate("/u/" + api.authStore.model.username);
                                }}
                              class="rounded-full">
                                View Profile
                              </a>
                            </li>
                            {typeof window != "undefined" &&
                            api.authStore.model.postr_plus ? (
                              <li>
                                <a class="rounded-full">
                                  Your benefits
                                  <span class="badge badge-outline border-blue-500 text-blue-500">
                                    ++
                                  </span>
                                </a>
                              </li>
                            ) : (
                              ""
                            )}
                            <li>
                              <a class="rounded-full">Set Status</a>
                            </li>
                            <li>
                              <a class="rounded-full"
                                onClick={() => {
                                  //@ts-ignore
                                  document
                                    .getElementById("logout-modal")
                                    //@ts-ignore
                                    .showModal();
                                }}
                              >
                                Logout{" "}
                                <span class="font-bold">
                                  {" "}
                                  @{api.authStore.model.username}
                                </span>
                              </a>
                            </li>
                          </ul>
                        </div>
                        <div class="flex flex-col">
                          <p class="font-bold ">
                            {  api.authStore.model.username}
                          </p>
                          <p class="text-lg">
                            @ {api.authStore.model.username}
                          </p>
                        </div>
                      </div>

                      <div class="flex gap-4"> 
                        <Bookmark class="w-7 h-7" />
                        <Settings class="w-7 h-7 hover:cursor-pointers"  onClick={() => {
                          navigate("/settings");
                        }} />
                      </div>
                    </div>
                   
                  </div>
                </div>
              </div>
      <div class={joinClass("  sm:p-3  mt-3  text-sm     justify-between flex  ", )}>
        <div class="flex flex-col rounded">
          <p
            class={joinClass("cursor-pointer", page() !== "recommended" ? "text-gray-500" : "")}
            onClick={() => {
              swapFeed("recommended", 0);
            }}
          >
            Recommended
          </p>
          {page() === "recommended" ? (
            <div class="rounded-md   h-[2px] bg-blue-500"></div>
          ) : (
            ""
          )}
        </div>
        <div class="flex flex-col text-sm">
          <p
            class={joinClass("cursor-pointer", page() !== "following" ? "text-gray-500" : "")}
            onClick={() => {
              swapFeed("following", 0);
            }}
          >
            Following
          </p>
          {page() === "following" ? (
            <div class=" rounded-md    h-[2px] bg-blue-500"></div>
          ) : (
            ""
          )}
        </div>
        <div class="flex flex-col text-sm">
          <p
            class={joinClass("cursor-pointer", page() !== "following" ? "text-gray-500" : "")}
            onClick={() => {
             swapFeed("trending", 0);
            }}
          >
            Trending
          </p>
          {page() === "trending" ? (
            <div class=" rounded-md   h-[2px] bg-blue-500"></div>
          ) : (
            ""
          )}
        </div>

        
      </div> 
      <Portal >
        <LogoutModal  />
      </Portal>
    </div>
  );
}
