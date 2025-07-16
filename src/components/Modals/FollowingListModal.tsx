import { createEffect, For, Show } from "solid-js";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import { api } from "@/src";
import ArrowLeft from "../Icons/ArrowLeft";
import useNavigation from "@/src/Utils/Hooks/useNavigation";

export default function FollowingListModal({
  user,
  show,
  setFollowing,
  setShow,
  setUser,
}: {
  user: any;
  show: () => boolean;
  setFollowing: (followers: any[]) => void;
  setShow: (b: boolean) => void;
  setUser: (user: any) => void;
}) {
  const { theme } = useTheme();
  const { navigate } = useNavigation();

  createEffect(() => {
    if (show()) {
      window.dispatchEvent(new CustomEvent("hide-post-button"));
    }
  });

  const handleClose = () => setShow(false);

  const handleNavigate = (username: string) => {
    navigate(`/u/${username}`);
    handleClose();
  };

  return (
    <Show when={show()}>
      <dialog
        id="following-list-modal"
        class="modal modal-open"
        aria-label="Following list"
      >
        <div
          class={joinClass(
            "modal-content overflow-y-auto sm:w-[24rem] sm:max-h-[70vh] w-[27rem] rounded-xl p-5",
            theme() === "dark" ? "bg-base-300 text-white" : "bg-white text-black"
          )}
        >
          <div class="flex justify-between items-center mb-4">
            <ArrowLeft
              class="w-5 h-5 cursor-pointer"
              onClick={handleClose}
            />
            <p class="flex-1 text-center text-lg font-medium">
              {user().id === api.authStore.model.id
                ? `${api.authStore.model.username}'s Following`
                : `Who ${user().username} Follows`}
            </p>
            <div class="w-5" /> {/* Spacer to balance the ArrowLeft */}
          </div>

          <div class="flex flex-col gap-4 mt-2">
            <Show when={user().expand.following?.length > 0} fallback={
              <p class="text-center text-lg mt-16 opacity-70">
                {user().username} doesn’t follow anyone yet.
              </p>
            }>
              <For each={user().expand.following}>
                {(following) => (
                  <button
                    type="button"
                    class="flex w-full justify-between items-center gap-4 px-2 py-2 rounded-lg hover:bg-base-200 transition"
                    onClick={() => handleNavigate(following.username)}
                  >
                    <div class="flex items-center gap-4">
                      <Show when={following.avatar} fallback={
                        <div class="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center text-lg font-semibold">
                          <span class={theme() === "dark" ? "text-white" : "text-black"}>
                            {following.username[0].toUpperCase()}
                          </span>
                        </div>
                      }>
                        <img
                          src={api.cdn.getUrl("users", following.id, following.avatar)}
                          alt={`${following.username}'s avatar`}
                          class="w-12 h-12 rounded-full object-cover"
                        />
                      </Show>
                      <div class="text-left">
                        <p class="font-medium">{following.username}</p>
                      </div>
                    </div>
                  </button>
                )}
              </For>
            </Show>
          </div>
        </div>
      </dialog>
    </Show>
  );
}
