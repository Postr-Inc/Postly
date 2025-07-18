import { createSignal, ErrorBoundary, onMount, Show } from "solid-js";
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
import DeleteAccountModal from "@/src/components/Modals/DeleteAccountModal";
import Alert from "../Alerts/Alert";
import EditProfileModal from "@/src/components/Modals/EditProfileModal";
import EditAccountModal from "@/src/components/Modals/EditAccountModal";
import JoinPostlyModal from "../Modals/JoinPostlyModal";
import BlockUserModal from "@/src/components/Modals/BlockedModal";
import PostlyPlusModal from "@/src/components/Modals/PostlyPlusModal";
export default function Page(props: { children: any, params: () => any, route: () => string, navigate: any, id: string, hide?: string[] }) {
  const [checkedAuth, setCheckedAuth] = createSignal(false);

  onMount(async () => {
    await api.checkAuth();
    if (!api.authStore.isValid()) {
      try {
        await api.authStore.getBasicAuthToken();
      } catch (err) {
        console.warn("Unable to issue basic auth token:", err);
      }
    }
  });

  const hideSidebars = ["/auth/login", "/auth/signup", "/auth/forgot"].includes(props.route());

  return <>
    <div id={props.id} class="relative   bg-base-100 sticky flex justify-center">

      <Portal>
        <Alert />
        <RegisterModal />
      </Portal>

      {/* Centered container with max width */}
      <div class="relative w-full max-w-screen-xl xl:px-4 2xl:px-4 lg:px-8 flex justify-center">

        {/* Left Sidebar */}
        {!hideSidebars && (
          <div
            class="hidden lg:block scroll overflow-none fixed top-0   p-4"
            style={{
              left: "max(calc(50vw - 660px), 2rem)", // aligned to left edge of centered content
              width: "280px",
            }}>
            <SideBarLeft {...props} />
          </div>
        )}

        {/* Main content area */}
        <main
          class="w-full  2xl:max-w-[694px] xl:max-w-[600px] sm:max-w-screen mx-auto xl:px-4"
          style={{
            minWidth: "20px",
          }}
        >
          {props.children}
        </main>

        {/* Right Sidebar */}
        {!hideSidebars && (
          <div
            class="hidden xl:block fixed top-0 p-4"
            style={{
              right: "max(calc(50vw - 620px), 6rem)", // aligned to right edge of centered content
              width: "280px",
            }}
          >
            <SideBarRight {...props} />
          </div>
        )}
      </div>

      {/* Bottom navigation for mobile */}
      {!props.hide?.includes("bottomNav") && (
        <div class="lg:hidden fixed bottom-0 w-full z-20">
          <BottomNav />
        </div>
      )}
    </div>

    <Portal>
      <Browser />
      <CreatePostModal />
      <DeleteAccountModal />
      <EditAccountModal />
      <BlockUserModal />
      <JoinPostlyModal />
      <PostlyPlusModal />
    </Portal>   <style>
      {`
       
        /* Hide scrollbar for all browsers */
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE 10+ */
        }
      `}
    </style>
  </>;
}



