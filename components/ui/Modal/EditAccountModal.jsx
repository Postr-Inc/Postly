import { api } from "@/src";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import {
  createSignal,
  createEffect,
  Switch,
  Match,
  For,
  onMount,
} from "solid-js";

export default function EditAccountModal(props) {
  if (!api.authStore.model.id) return <div></div>;
  const { theme } = useTheme();
  const [username, setUsername] = createSignal(api.authStore.model.username);
  const [bio, setBio] = createSignal(api.authStore.model.bio);
  const [modalFor, setModalFor] = createSignal("");
  let [isSaving, setIsSaving] = createSignal(false);
  let [user, setUser] = createSignal(api.authStore.model);

  async function save() {
    let data = {
      ...(username() !== api.authStore.model.username && {
        username: username(),
      }),
    };
    console.log(data);
    if (Object.keys(data).length === 0) return;
    setIsSaving(true);
    try {
      let data2 = await api
        .collection("users")
        .update(api.authStore.model.id, data, {
          invalidateCache: [`/u/user_${api.authStore.model.username}`],
        });
      setIsSaving(false);
      document.getElementById("editProfileModal")?.close();
      let oldUser = api.authStore.model;
      let newUser = { ...oldUser, ...data2 };
      //@ts-ignore
      api.authStore.model = newUser;
      newUser.token = oldUser.token;
      localStorage.setItem("postr_auth", JSON.stringify(newUser));
      document.getElementById("editAccountModal").close();
      dispatchEvent(new CustomEvent("authChange"));
      setUser(newUser);
    } catch (error) {
      console.log(error);
      setIsSaving(false);
    }
  }

  onMount(() => {
    window.addEventListener("modal-for", (e) => {
      setModalFor(e.detail);
    });
  });
  return (
    <dialog
      id="editAccountModal"
      class="modal xl:overflow-scroll   sm:h-screen sm:w-screen "
    >
      <div
        class={joinClass(
          "modal-content   sm:w-screen sm:h-screen     w-[27rem]  xl:rounded-xl",
          theme() === "dark" ? "bg-black" : "bg-white",
        )}
      >
        <div class="modal-header p-3 flex justify-between">
          <p
            class="cursor-pointer"
            onClick={() =>
              document.getElementById("editAccountModal").close() &&
              setUsername(api.authStore.model.username)
            }
          >
            Cancel
          </p>
          <h2>{modalFor()}</h2>
          <button
            onClick={save}
            disabled={isSaving()}
            class={joinClass(
              "btn btn-sm rounded-full ",
              theme() === "dark"
                ? "bg-white text-black hover:bg-black"
                : "bg-black text-white",
            )}
          >
            {isSaving() ? "Saving..." : "Save"}
          </button>
        </div>

        <div class="p-3">
          <div class="flex flex-col mt-5 gap-5 p-2">
            <label class="font-bold">Current</label>
            {modalFor() == "Email" ? user().email : user().username}
          </div>
          <div class="flex flex-col mt-2 gap-5 p-2">
            <label>New</label>
            <div
              contentEditable={true}
              class="focus:outline-none border border-t-0 border-l-0 border-r-0 "
              onInput={(e) => {
                if (modalFor() == "Username") {
                  setUsername(e.target.textContent.split("@")[1]);
                }
              }}
              onFocus={(e) => {
                if (e.target.innerHTML == "Username") {
                  e.target.innerHTML = "@";
                }
              }}
            >
              {modalFor() == "Email" ? "Email" : "Username"}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
