import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import { api } from "@/src";
import { dispatchAlert } from "@/src/Utils/SDK";
import { createSignal } from "solid-js";

export default function DeletePostModal({id, setPosts} : {id: string, setPosts: any}) {
  const { theme } = useTheme();

  const [loading, setLoading] = createSignal(false)
  async function deletePost() {
     setLoading(true)
     const { success } = await api.send("/actions/posts/delete", {
      body: {
        targetId:id
      }
    });

    if (success) { 
      setPosts?.((posts: any[]) => posts.filter((post) => post.id !== id));
      dispatchAlert({
        message:"Successfully Deleted Post",
        type:"success"
      })
      
      closeModal()
      setLoading(false)
    }
  }

  function closeModal() {
    (document.getElementById(`delete-post-modal-${id}`) as HTMLDialogElement)?.close();
  }

  return (
    <dialog
      id={`delete-post-modal-${id}`}
      class="modal flex items-center justify-center p-4"
    >
      <div
        class={joinClass(
          "modal-content w-full max-w-md rounded-2xl p-6 shadow-lg",
          theme() === "dark" ? "bg-[#121212] text-white" : "bg-white text-black"
        )}
      >
        <h2 class="text-xl font-semibold mb-2">Delete Post</h2>
        <p class="text-sm mb-6 leading-relaxed text-gray-500 dark:text-gray-400">
          Please confirm that you want to delete this post.
          <br />
          <br />
          Once deleted this post will not be accessible, please note that often times posts can still be seen until they are fully expired.
        </p>

        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
            onClick={deletePost}
          >
           {loading() ? <span class="loading loading-spinner flex jsutify-center mx-auto"></span> :  "Delete Post"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
