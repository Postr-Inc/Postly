import useTheme from "../../Utils/Hooks/useTheme";
import { api } from "../..";
import { joinClass } from "@/src/Utils/Joinclass";
import { Accessor, onMount, Show } from "solid-js";
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
  const [hide, setHide] = createSignal(false)

 
  return (
    <div
      class={joinClass(
        "flex flex-col sticky top-0 sm:p-0 md:p-4 z-[9999]",
        
        "backdrop-blur-sm",
        hide() && mobile() ? "hidden" : ""
      )}
    >
      <div class="flex   w-full sm:p-3  z-[9999999] justify-between ">
        <div class="flex gap-2 hero">
          <div class="flex flex-col   w-full">
            <div class="flex  justify-between gap-2 w-full">
              <div class="flex flex-row  gap-2  ">
                <div class="dropdown     ">
                  <label tabIndex={0}
                  >
                    {typeof window != "undefined" ? (
                      <>
                        {api.authStore.model?.avatar ? (
                          <img
                            src={api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar)}
                            alt={api.authStore.model.username}
                            class="rounded object-cover w-12 h-12 cursor-pointer"
                          ></img>
                        ) : (
                           <img
                            src={"/icons/usernotfound/image.png"}
                            alt={api.authStore.model.username}
                            class="rounded object-cover w-12 h-12 cursor-pointer"
                          ></img>
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
                    {
                      api.authStore.model.id && <li>
                        <a
                          onClick={() => {
                            navigate("/u/" + api.authStore.model.username);
                          }}
                          class="rounded-full">
                          View Profile
                        </a>
                      </li>
                    }
                    {typeof window != "undefined" &&
                      api.authStore.model.postr_plus && api.authStore.model.id ? (
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
                      <a class="rounded-full"
                        onClick={() => {
                          //@ts-ignore
                          if (!api.authStore.model.id) {
                            //@ts-ignore 
                            requireSignup()
                          } else {
                            //@ts-ignore
                            document
                              .getElementById("logout-modal")
                              //@ts-ignore
                              .showModal();
                          }
                        }}
                      >
                        {!api.authStore.model.id && "Join the Community!"}
                        {api.authStore.model.id && <p>
                          Logout
                          <span class="font-bold">
                            {" "}
                            @{api.authStore.model.username}
                          </span></p>}
                      </a>
                    </li>
                  </ul>
                </div>
                {
                  api.authStore.model.id && <div class="flex flex-col">
                    <p class="font-bold ">
                      {api.authStore.model.username}
                    </p>
                    <p class="text-lg">
                      @ {api.authStore.model.username}
                    </p>
                  </div>
                }
              </div>

              <div class="flex gap-4">
                <Bookmark class="w-7 h-7" onClick={()=>{
                  if(!api.authStore.model.id) {
                   requireSignup()
                    return;
                  } 
                  navigate("/bookmarks")
                }}/>
                <Settings class="w-7 h-7  cursor-pointer" onClick={() => {
                  if(!api.authStore.model.id) {
                   requireSignup()
                    return;
                  }  
                  navigate("/settings");
                }} />
              </div>
            </div>

          </div>
        </div>
      </div>
      <div class={joinClass("  sm:p-3  mt-3  text-sm    justify-between  flex  ",)}>
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
        <Show when={api.authStore.model.id}>
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
        </Show>
        <Show when={!api.authStore.model.id}>
          <div></div>
        </Show>
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
        <LogoutModal />
      </Portal>
    </div>
  );
}
