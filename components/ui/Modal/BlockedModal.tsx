import { api } from "@/src"
import { dispatchAlert } from "@/src/Utils/SDK"
import { createSignal, onMount, onCleanup, Show } from "solid-js"

export default function BlockUserModal() {
    const [isBlocking, setIsBlocking] = createSignal(false) 
    const [setPostsFunction, setSetPostsFunction] = createSignal(null)
    const [userToBlock, setUserToBlock] = createSignal<User>({
        id: "123",
        name: "John Doe",
        username: "@johndoe",
        avatar: "/placeholder.svg?height=40&width=40",
    })

    const closeModal = () => {
        const modal = document.getElementById("block_user_modal") as HTMLDialogElement | null
        modal?.close()
        setIsBlocking(false)
    }

    const handleBlockUser = async () => {
        try {
            setIsBlocking(true)
 
            await api.send("/actions/users/block", {
                body: {
                    targetId: userToBlock().id
                }
            })

            console.log(`Blocking user: ${userToBlock().name}`)

            if(setPostsFunction()){

                //@ts-ignore
                setPostsFunction().setPosts(p => p.filter(post => post.author !== e.detail.user.id));
            }
             

            api.resetCache(`posts_recommended_feed_${api.authStore.model.id}_home`)
            dispatchAlert({
                type: "success",
                message: "SuccessFully Blocked User"
            })

            setIsBlocking(false)
            closeModal()
        } catch (error) {
            dispatchAlert({
                type: "error",
                message: error.message
            })

        }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            closeModal()
        }
    }

    onMount(() => {
        window.addEventListener("block-user", (e) => {
            console.log(e.detail)
            // ✅ Always set a new copy to force Solid reactivity
            setUserToBlock({ ...e.detail.user })
            setPostsFunction(e.detail.setPosts)
             
            const modal = document.getElementById("block_user_modal") as HTMLDialogElement | null 

            if (modal) {
                if (modal.open) {
                    // If already open, close first to safely reopen
                    modal.close()
                }
                modal.showModal()
            }
        })
    })

    return (
        <dialog id="block_user_modal" class="modal  modal-middle">
            <div class="modal-box">
                <button
                    onClick={closeModal}
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                    ✕
                </button>

                <h3 class="font-bold text-xl mb-2">Block User</h3>

                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                        <Show when={userToBlock().avatar}>
                            <img src={api.cdn.getUrl("users", userToBlock().id, userToBlock().avatar )}></img>

                        </Show>
                        <Show when={!userToBlock().avatar}>
                             <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            class="text-gray-600"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        </Show>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-900">{userToBlock().name}</p>
                        <p class="text-sm text-gray-500">{userToBlock().username}</p>
                    </div>
                </div>

                <p class="text-gray-700 mb-3">
                    Are you sure you want to block <strong>{userToBlock().name}</strong>?
                </p>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <div class="flex gap-2">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            class="text-yellow-600 flex-shrink-0 mt-0.5"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div class="text-sm text-yellow-800">
                            <p class="font-medium mb-1">This action will:</p>
                            <ul class="list-disc list-inside text-xs">
                                <li>Prevent them from contacting you</li>
                                <li>Hide their posts from your feed</li>
                                <li>Remove them from your followers</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="modal-action flex gap-3">
                    <form method="dialog">
                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={isBlocking()}
                            class="btn btn-ghost"
                        >
                            Cancel
                        </button>
                    </form>
                    <button
                        onClick={handleBlockUser}
                        disabled={isBlocking()}
                        class="btn btn-error"
                    >
                        {isBlocking() ? "Blocking..." : "Block User"}
                    </button>
                </div>
            </div>
        </dialog>
    )
}
