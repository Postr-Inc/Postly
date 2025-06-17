import { ErrorBoundary, Show } from "solid-js";
import { Resizable, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { SideBarLeft } from "@/src/components/Navbars/Sidebars/left";
import { SideBarRight } from "@/src/components/Navbars/Sidebars/right";
import BottomNav from "@/src/components/Navbars/BottomNav";
import useTheme from "../Hooks/useTheme";
import { joinClass } from "../Joinclass";
import { api } from "@/src";
import CreatePostModal from "@/src/components/Modals/CreatePostModal";
import Browser from "@/src/components/Browser";
import RegisterModal from "../Modals/RegisterModal";
import { Portal } from "solid-js/web";
export default function Page(props: { children: any , params: ()=> any, route: () => string, navigate: any, id: string, hide?: string[] }) {
     const { theme } = useTheme();
    return <>
   <div id={props.id} class={joinClass("relative xl:flex xl:w-[30vw] w-[100vw]   xl:p-0  lg:flex   2xl:w-[79rem]    justify-center xl:mx-auto ", )}>
         <Show when={props.route() !== "/auth/login" && props.route() !== "/auth/signup" && props.route() !== "/auth/forgot"}>
         <SideBarLeft {...{
             params: props.params,
             route: props.route,
             navigate: props.navigate,
        }} />
        </Show>
        
        <div class={joinClass("flex flex-col  h-full w-full  ", theme() === "dark" ? "border border-[#3e3e3e] sm:border-none" : "sm:border-none border border-gray-200")}>
            
        {props.children}
        </div>

        <Show when={props.route() !== "/auth/login" && props.route() !== "/auth/signup" && props.route() !== "/auth/forgot"}>
        <SideBarRight {...{
             params: props.params,
             route: props.route,
             navigate: props.navigate,
        }} />
        </Show> 

        
       {
          !props.hide?.includes("bottomNav") && (
               <BottomNav />
          )
       }
    </div> 
    <Portal>
     
    <Browser />
    
    <RegisterModal />
    <CreatePostModal />  
    </Portal>
    </>
}
