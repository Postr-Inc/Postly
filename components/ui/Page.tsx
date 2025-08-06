import { createSignal, ErrorBoundary, onMount, Show } from "solid-js";
import { SideBarLeft } from "@/components/ui/Navbars/Sidebars/left";
import { SideBarRight } from "@/components/ui/Navbars/Sidebars/right";
import BottomNav from "@/components/ui/Navbars/BottomNav";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import { api } from "@/src";
import CreatePostModal from "./Modal/CreatePostModal";
import Browser from "./Browser";
import RegisterModal from "./Modal/RegisterModal";
import { Portal } from "solid-js/web";
import DeleteAccountModal from "./Modal/DeleteAccountModal";
import Alert from "./Alerts/Alert";
import EditAccountModal from "./Modal/EditAccountModal";
import JoinPostlyModal from "./Modal/JoinPostlyModal";
import BlockUserModal from "./Modal/BlockedModal";
import PostlyPlusModal from "./Modal/PostlyPlusModal";
export default function Page(props: {
  children: any;
  params: () => any;
  route: () => string;
  navigate: any;
  id: string;
  hide?: string[];
}) {
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

  const hideSidebars = ["/auth/login", "/auth/signup", "/auth/forgot"].includes(
    props.route(),
  );

  return (
    <>
      <div
        id={props.id}
        class="relative   bg-base-100 sticky flex justify-center"
      >
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
              }}
            >
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
      </Portal>{" "}
      <style>
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
    </>
  );
}
