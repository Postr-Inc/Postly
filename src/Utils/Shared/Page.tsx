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

    // If still not valid, try basic token
    if (!api.authStore.isValid()) {
      try {
        await api.authStore.getBasicAuthToken();
      } catch (err) {
        console.warn("Unable to issue basic auth token:", err);
      }
    }
  });
  return <>


    <div id={props.id} class={joinClass(
      "relative flex justify-center w-full",
      "px-0 sm:px-4 lg:px-8"
    )}>
      <Portal>
        <Alert />
        <RegisterModal />
      </Portal>

      <Show when={!["/auth/login", "/auth/signup", "/auth/forgot"].includes(props.route())}>
        <div class="hidden xl:block mr-6">
          <SideBarLeft {...props} />
        </div>
      </Show>

      <div class="flex flex-col w-full max-w-[40rem]">
        {props.children}
      </div>

      <Show when={!["/auth/login", "/auth/signup", "/auth/forgot"].includes(props.route())}>
        <div class="hidden xl:block ml-6">
          <SideBarRight {...props} />
        </div>
      </Show>

      {
        !props.hide?.includes("bottomNav") && <BottomNav />
      }
    </div>

    <Portal>

      <Browser />

      <CreatePostModal />
      <DeleteAccountModal />
      <EditAccountModal />
      <BlockUserModal />
      <JoinPostlyModal />
      <PostlyPlusModal />
    </Portal>

  </>
}
