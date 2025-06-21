import { Show } from "solid-js";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import { api } from "@/src";
import ArrowLeft from "../Icons/ArrowLeft";
export default function ({ user, show, setFollowing }: { user: any, show: any, setFollowing: (following: any[]) => void }) {
    const { theme } = useTheme()
    return (
        <Show when={show()}>
            <dialog id="following-list-modal" class="modal h-full overflow-scroll   modal-open ">
                <div class={joinClass("modal-content   sm:w-[23rem]     p-5 w-[27rem]  rounded-xl", theme() === "dark" ? "bg-black" : "bg-white")}>
                    <div class="flex  justify-between">
                        <ArrowLeft class="w-6 h-6" />
                        <Show when={user().id !== api.authStore.model.id}>
                            <p>See who {user().username} is following</p>
                        </Show>
                        <Show when={user().id == api.authStore.model.id}>
                            <p>Following List</p>
                        </Show>
                        <div></div>
                    </div>
                </div>
            </dialog>
        </Show>
    )
}
