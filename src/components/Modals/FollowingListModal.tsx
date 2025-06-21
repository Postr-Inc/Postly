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

  

    return (
        <Show when={show()}>
            <dialog
                id="following-list-modal"
                class="modal modal-open"
                aria-label="Following list"
            >
                <div
                    class={joinClass(
                        "modal-content overflow-y-auto  sm:w-[24rem] h-fit p-5 w-[27rem] rounded-xl",
                        theme() === "dark" ? "bg-black" : "bg-white"
                    )}
                >
                    <div class="flex justify-between items-center mb-4">
                        <ArrowLeft
                            class="w-5 h-5 cursor-pointer"
                            onClick={() => setShow(false)}
                        />
                        <p class="text-center flex-1 text-lg font-medium">
                            {user().id === api.authStore.model.id
                                ? `${api.authStore.model.username}`
                                : `See who ${user().username} is following`}
                        </p>
                        <div class="w-5" /> {/* empty spacer */}
                    </div>

                    <div class="flex flex-col gap-5 mt-4">
                        <Show when={user().following.length > 0}>
                            <For each={user().expand.following}>
                            {(following) => {
                                const isOwnProfile = user().id === api.authStore.model.id;
                                const isFollowing = api.authStore.model.following?.some(
                                    (f: any) => f === following.id
                                );

                                return (
                                    <div class="flex justify-between items-center gap-5">
                                        <div
                                            class="flex gap-4 items-center cursor-pointer"
                                            onClick={() => {
                                                navigate(`/u/${following.username}`)
                                                 setShow(false)
                                            }}
                                        >
                                             <Show when={following.avatar}> 
                                                <img
                                                src={api.cdn.getUrl("users", following.id, following.avatar)}
                                                alt="avatar"
                                                class="rounded-full w-12 h-12 object-cover"
                                            />
                                             </Show>
                                             <Show when={!following.avatar}>
                                                 <div class="rounded-full w-12 h-12  border-4 border-white te   bg-base-300 flex items-center justify-center">
                                                                    <p class="text-sm text-black">{following.username[0]}</p>
                                                </div>
                                                                 
                                             </Show>
                                            <p class="hover:underline">{following.username}</p>
                                        </div>
 
                                    </div>
                                );
                            }}
                        </For>

                        </Show>
                        <Show when={user().following.length < 1}>
                            <p class="text-2xl mt-12 text-center">
                                {user().username} Does not follow anyone
                            </p>
                        </Show>
                    </div>
                </div>
            </dialog>
        </Show>
    );
}
