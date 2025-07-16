import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import { api } from "@/src";

export default function DeleteAccountModal() {
  const { theme } = useTheme();

  function deleteAccount() {
    api.authStore.deleteAccount();
    localStorage.removeItem("postr_auth");
    window.location.href = "/";
  }

  function closeModal() {
    (document.getElementById("deleteModalConfirm") as HTMLDialogElement)?.close();
  }

  return (
    <dialog
      id="deleteModalConfirm"
      class="modal flex items-center justify-center p-4"
    >
      <div
        class={joinClass(
          "modal-content w-full max-w-md rounded-2xl p-6 shadow-lg",
          theme() === "dark" ? "bg-[#121212] text-white" : "bg-white text-black"
        )}
      >
        <h2 class="text-xl font-semibold mb-2">Delete your account</h2>
        <p class="text-sm mb-6 leading-relaxed text-gray-500 dark:text-gray-400">
          Are you sure you want to delete your account? We recommend deactivating
          your account instead — it’s a safer way to hide your profile from others.
          <br />
          <br />
          Deleting your account is <span class="font-bold">permanent</span> and
          cannot be undone.
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
            onClick={deleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
    </dialog>
  );
}
