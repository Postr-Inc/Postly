import { api } from "@/src";
import logo from "@/src/assets/icon_transparent.png";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import Home from "../../Icons/Home";
import Dropdown, { DropdownHeader, DropdownItem } from "../../UI/UX/dropdown";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import { Portal } from "solid-js/web";
export function SideBarLeft(props: {
  params: () => any;
  route: () => string;
  navigate: any;
}) {
  const error = false;
  let { theme } = useTheme();
  const { route, navigate } = useNavigation()
  console.log(route());
  return (
    <>
      <div class="xl:drawer xl:w-[auto]  md:p-2  mr-5   xl:drawer-open lg:drawer-open  ">
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
        <div class="drawer-side">
          <label aria-label="close sidebar" class="drawer-overlay"></label>
          <ul class="menu   w-64  flex flex-col gap-5 min-h-full  text-base-content">
            {/* Sidebar content here */}

            <li class="hover:bg-transparent">
              <a  >
                <img src={logo} class={joinClass("rounded w-12 h-12", theme() == "light" && "black")} width={40}></img>
              </a>
            </li>
            <li>
              <a
                class={joinClass("text-lg  rounded-full ",   route() === "/" ? "fill-blue-500 stroke-blue-500 text-blue-500 font-bold" : 
                theme() === "dark" ? "fill-white stroke-white text-white" : "  stroke-black"
                )}
                onClick={() => {
                  // @ts-ignore
                  navigate(`/`);
                }}
              >
                <Home class= {joinClass("w-7 h-7")} />
                Home
              </a>
            </li>
            <li>
              <a     class={joinClass("text-lg  rounded-full ",   route() === "/snippets" ? "fill-blue-500 stroke-blue-500 text-blue-500 font-bold" : 
                theme() === "dark" ? "fill-white stroke-white text-white" : "  stroke-black"
                )} onClick={()=> navigate("/snippets")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={1.5}
                  stroke="currentColor"
                  class="w-7 h-7"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m7.848 8.25 1.536.887M7.848 8.25a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Zm1.536.887a2.165 2.165 0 0 1 1.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 1 1-5.196 3 3 3 0 0 1 5.196-3Zm1.536-.887a2.165 2.165 0 0 0 1.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863 2.077-1.199m0-3.328a4.323 4.323 0 0 1 2.068-1.379l5.325-1.628a4.5 4.5 0 0 1 2.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.33 4.33 0 0 0 10.607 12m3.736 0 7.794 4.5-.802.215a4.5 4.5 0 0 1-2.48-.043l-5.326-1.629a4.324 4.324 0 0 1-2.068-1.379M14.343 12l-2.882 1.664"
                  />
                </svg>
                Snippets
              </a>
            </li>
            <li>
              <a class="text-lg  rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="      w-7 h-7   cursor-pointer     hover:fill-black hover:text-black         "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  ></path>
                </svg>
                Notifications
              </a>
            </li>
            <li>
              <a class="text-lg  rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={1.5}
                  stroke="currentColor"
                  class="   w-7 h-7"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                Explore
              </a>
            </li>
             {
              api.authStore.model.id && <li>
              <a
                class={`text-xl  rounded-full rounded-full
                    ${
                      route() === `/u/${api.authStore.model.username}`
                        ? "fill-blue-500 stroke-blue-500 text-blue-500"
                        : "fill-white"
                    }
                  `}
                onClick={() => {
                  // @ts-ignore
                  navigate(`/u/${api.authStore.model.username}`, {id: api.authStore.model.username});
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-lidth={1.5}
                  stroke="currentColor"
                  class={`
                   w-7 h-7
                  fill-inherit
                  `}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                Profile
              </a>
            </li>
             }
            <li class="text-lg  rounded-full  text-start hover:outline-none  hover:text-lg  hover:justify-start hover:rounded-full">
              <a onClick={() => {}} class=" rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={1.5}
                  stroke="currentColor"
                  class="w-7 h-7"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                  />
                </svg>
                Ai
              </a>
            </li>

            <li class="text-lg  rounded-full">
              <a
                class=" rounded-full"
                onClick={() => {
                  // @ts-ignore
                  document.getElementById("postr_plus").showModal();
                }}
              >
                <img src={logo} class={joinClass("rounded w-8 h-8", theme() == "light" && "black")}></img>
                <p>Premium</p>
              </a>
            </li>
            <li class="text-lg  rounded-full  text-start hover:outline-none  hover:text-lg  hover:justify-start hover:rounded-full">
              <a
                onClick={() => {}}
                class={`
                rounded-full 
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width={1.5}
                  stroke="currentColor"
                  class="w-7 h-7"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                Messages
              </a>
            </li>
             
            <button
              onClick={() => {
                if(api.authStore.model.id){
                    //@ts-ignore
                document.getElementById("createPostModal").showModal();
                  //@ts-ignore 
                }else{
                  //@ts-ignore
                  requireSignup()
                }
              }}
              class="btn rounded-full  text-lg hero btn-ghost  hover:bg-blue-500 focus:bg-blue-500 bg-blue-500 text-white "
            >
               {api.authStore.model.id && <p>{window.location.pathname.includes("/view") ? "Create Comment" : "Post"} </p>}
               {!api.authStore.model.id && <p>Join The Community !</p>}
            </button>
            
          </ul>
        </div>
      </div>
       <Portal>
        <dialog id="postr_plus" class="modal max-w-[100vw] max-h-[100vh] w-screen h-screen backdrop:bg-black/80">
        <div class="modal-box w-screen h-screen max-w-[100vw] max-h-[100vh] rounded-none p-0 overflow-hidden">
          {/* Background */}
          <div class="flex flex-col bg-background w-full h-full relative">
            {/* Close button */}
            <button
              class="absolute focus:outline-none top-4 right-4 z-50 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              onClick={() => {
                // @ts-ignore
                document.getElementById("postr_plus")?.close()
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                class="h-4 w-4"
              >
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
              <span class="sr-only">Close</span>
            </button>

            {/* Main content */}
            <div class="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-4xl mx-auto w-full">
              {/* Header */}
              <div class="text-center space-y-4 mb-8">
                <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                  ✨ Premium
                </div>
                <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Upgrade to Postr Plus</h1>
                <p class="text-xl text-muted-foreground max-w-2xl">
                  Support the project further by upgrading — get access to new features early and a sweet badge
                </p>
              </div>

              {/* Features */}
              <div class="grid gap-6 md:grid-cols-3 w-full mb-8">
                <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div class="flex items-center space-x-4 mb-4">
                    <div class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        class="h-4 w-4"
                      >
                        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold">Early Access</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Get access to new features and updates before they're released to the public.
                  </p>
                </div>

                <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div class="flex items-center space-x-4 mb-4">
                    <div class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        class="h-4 w-4"
                      >
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M14 9h1.5a2.5 2.5 0 0 0 0-5H14" />
                        <path d="M6 9v6" />
                        <path d="M14 9v6" />
                        <path d="m6 15 7-6" />
                        <path d="m13 20 7-6" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold">Premium Badge</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Show your support with a special badge that appears on your profile.
                  </p>
                </div>

                <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div class="flex items-center space-x-4 mb-4">
                    <div class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        class="h-4 w-4"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-semibold">Support Project</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Help keep Postr open source and support continued development.
                  </p>
                </div>
              </div>

              {/* Pricing Card */}
              <div class="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md mb-8">
                <div class="flex flex-col space-y-1.5 p-6 pb-4">
                  <h3 class="text-2xl font-semibold leading-none tracking-tight text-center">Postr Plus</h3>
                  <p class="text-sm text-muted-foreground text-center">Everything you need to support the project</p>
                </div>
                <div class="p-6 pt-0">
                  <div class="text-center mb-4">
                    <span class="text-4xl font-bold">$5</span>
                    <span class="text-muted-foreground">/month</span>
                  </div>
                  <ul class="space-y-2 text-sm mb-6">
                    <li class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        class="mr-2 h-4 w-4 text-primary"
                      >
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      Early access to new features
                    </li>
                    <li class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        class="mr-2 h-4 w-4 text-primary"
                      >
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      Premium badge on profile
                    </li>
                    <li class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        class="mr-2 h-4 w-4 text-primary"
                      >
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      Support open source development
                    </li>
                    <li class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        class="mr-2 h-4 w-4 text-primary"
                      >
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      Priority support
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action buttons */}
              <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1">
                  Coming Soon 
                </button>
                 
              </div>

              {/* Footer note */}
              <p class="text-xs text-muted-foreground text-center mt-6 max-w-md">
                Your support helps us maintain and improve Postr for everyone in the community. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </dialog>
       </Portal>
    </>
  );
}
