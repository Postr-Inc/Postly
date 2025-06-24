import { api } from "@/src";
import Modal from "../Modal";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import ArrowLeft from "../Icons/ArrowLeft";
import { createSignal, createEffect, Switch, Match, For } from "solid-js";

export default function EditProfileModal(
    {
        updateUser
    }: {
        updateUser: (data: any) => void
    }
) {
    if(!api.authStore.model.id) return <div></div>
    const { theme } = useTheme();
    const [avatar, setAvatar] = createSignal(api.authStore.model.avatar);
    const [avatarFile, setAvatarFile] = createSignal<File>();
    const [bannerFile, setBannerFile] = createSignal<File>();
    const [banner, setBanner] = createSignal(api.authStore.model.banner);
    const [username, setUsername] = createSignal(api.authStore.model.username);
    const [bio, setBio] = createSignal(api.authStore.model.bio);
    const [location, setLocation] = createSignal(api.authStore.model.location);
    const [social, setSocial] = createSignal(api.authStore.model.social); 
    const [deactivated, setDeactivated] = createSignal(api.authStore.model.deactivated)
    const [isSaving, setIsSaving] = createSignal(false);
    let [socialLinks, setSocialLinks] = createSignal(api.authStore.model.account_links ? api.authStore.model.account_links : [])
    let [addAccountLink, setAddAcountLinks] = createSignal(0) 
    async function bufferFile(file: File) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        return new Promise((resolve, reject) => {
            reader.onload = () => {
                resolve({ data: Array.from(new Uint8Array(reader.result as ArrayBuffer)), name: file.name, isFile: true });
            };
        });
    }
    async function handleFile(file: File) {
        if (file) {
            return await bufferFile(file);
        }
    }
    async function save() {
        let data = {
            ...(avatarFile() && { avatar: await handleFile(avatarFile()) }),
            ...(bannerFile() && { banner: await handleFile(bannerFile()) }),
            ...(username() !== api.authStore.model.username && { username: username() }),
            ...(bio() !== api.authStore.model.bio && { bio: bio() }),
            ...(location() !== api.authStore.model.location && { location: location() }),
            ...(social() !== api.authStore.model.social && { social: social() }),
            ...(deactivated() !== api.authStore.model.deactivated && {deactivated :  deactivated()}),
            ...(api.authStore.model.account_links != socialLinks() && {account_links: socialLinks()})
        } 
        console.log(data)
        if (Object.keys(data).length === 0) return;
        setIsSaving(true);
        try {
            let data2 = await api.collection("users").update(api.authStore.model.id, data, {
                invalidateCache:[`/u/user_${api.authStore.model.username}`]
            });
            console.log(data2)
            setIsSaving(false);
            document.getElementById("editProfileModal")?.close();
            let oldUser = api.authStore.model;
            let newUser = { ...oldUser, ...data2};
            //@ts-ignore
            api.authStore.model = newUser;
            newUser.token = oldUser.token;
            localStorage.setItem("postr_auth", JSON.stringify(newUser));
        } catch (error) {
            setIsSaving(false);
        }
        let copiedData = Object.assign({}, data);
        if (copiedData.avatar) {
            copiedData.avatar = URL.createObjectURL(avatarFile());
        }
        if (copiedData.banner) {
            copiedData.banner = URL.createObjectURL(bannerFile());
        }
        updateUser({ ...api.authStore.model, ...copiedData });
    }
    return (
        <dialog id="editProfileModal" class="modal xl:overflow-scroll   sm:h-screen sm:w-screen ">
            <div class={joinClass("modal-content   sm:w-screen sm:h-screen     w-[27rem]  xl:rounded-xl", theme() === "dark" ? "bg-black" : "bg-white")}>
                <div class="modal-header p-3 flex justify-between">
                    <svg
                        onClick={() => document.getElementById("editProfileModal")?.close()}
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 cursor-pointer   "><path fill-rule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clip-rule="evenodd"></path></svg>
                    <h2>Edit Profile</h2>
                    <button
                        onClick={save}
                        disabled={isSaving()}
                        class={
                            joinClass("btn btn-sm rounded-full ", theme() === "dark" ? "bg-white text-black hover:bg-black" : "bg-black text-white")
                        }>
                        {
                            isSaving() ? "Saving..." : "Save"
                        }
                    </button>
                </div>
                <div class="modal-body flex flex-col">
                    <div class="flex flex-col relative">
                      
                            <Switch>
                                <Match when={!api.authStore.model.banner && !bannerFile()}>
                                    <div class="w-full h-[6rem] rounded-md bg-base-200"></div> 
                                </Match>
                                <Match when={api.authStore.model.banner || bannerFile()}>
                                    
                            <img src={
                                bannerFile() ?  URL.createObjectURL(bannerFile()) :  api.cdn.getUrl("users", api.authStore.model.id,  api.authStore.model.banner )
                            } alt="banner" class="w-full h-[6rem] object-cover rounded-md" />
                                </Match>
                            </Switch> 
                            <div class="absolute btn btn-circle bg-[#030303] bg-opacity-25  inset-x-0 mx-auto translate-x-0   sm:left-[-4vw] text-white top-[30%]"><label for="change-banner"><button>
                               <label for="change-banner"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6  "><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"></path></svg></label></button></label></div>
                         
                        <input type="file" 
                        accept="image/*"
                        id="change-avatar" class="hidden" onInput={(e) => setAvatarFile(e.currentTarget.files![0])} />
                        <input type="file" 
                        accept="image/*"
                        id="change-banner" class="hidden" onChange={(e) => setBannerFile(e.currentTarget.files![0])} />
                       
                            <div class="absolute top-[40px] ">
                                <div class="relative w-32 left-3 ">
                                     <Switch>
                                        <Match when={api.authStore.model.avatar && !avatarFile()}>
                                            <img src={api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar)} alt="" class={joinClass("w-20 h-20 object-cover avatar rounded   border-2", theme() === "dark" ? "border-black" : "border-white")} />
                                        </Match>
                                        <Match when={!api.authStore.model.avatar && !avatarFile()}>
                                            <div class={joinClass("w-20 h-20 object-cover avatar rounded  bg-base-200  border-2", theme() === "dark" ? "border-black" : "border-white")}>{api.authStore.model.username[0]}</div>
                                        </Match>
                                        <Match when={avatarFile()}>
                                            <img src={URL.createObjectURL(avatarFile())} alt="" class={joinClass("w-20 h-20 object-cover avatar rounded   border-2", theme() === "dark" ? "border-black" : "border-white")} />
                                        </Match>
                                     </Switch>
                                </div>
                                  <label for="change-avatar"> 
                                <div class="absolute btn btn-circle bg-[#030303] bg-opacity-25  inset-x-0 mx-auto translate-x-0   left-[-2.2vw] sm:left-[-5.3vw] text-white top-[20%]"><label for="change-banner"><button>  <label for="change-avatar"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6  "><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"></path></svg></label></button></label></div>
                          </label>
                            </div> 

                    </div>

                </div>
                <div class="p-3">
                    <div class="flex flex-col mt-5 gap-5 p-2">
                        <label>
                            Username
                        </label>
                        <input type="text" value={api.authStore.model.username} class={joinClass("input focus:outline-none", theme() === "dark" ? "border border-[#464646] rounded" : "border border-[#cac9c9] focus:border-[#cac9c9]")}
                            onChange={(e) => setUsername(e.currentTarget.value)}
                        />
                    </div>
                    <div class="flex flex-col mt-2 gap-5 p-2">
                        <label>
                            Bio
                        </label>
                        <textarea class={joinClass("input p-2 h-[4rem] focus:outline-none resize-none", theme() === "dark" ? "border border-[#464646] rounded backdrop:" : "border border-[#cac9c9] focus:border-[#cac9c9]")}
                            value={api.authStore.model.bio}
                            onChange={(e) => setBio(e.currentTarget.value)}
                        ></textarea>
                    </div>
                    <div class="flex flex-col mt-2 gap-5 p-2">
                        <label>
                            Location
                        </label>
                        <input type="text"
                            value={api.authStore.model.location}
                            onChange={(e) => setLocation(e.currentTarget.value)}
                            class={joinClass("input focus:outline-none", theme() === "dark" ? "border border-[#464646] rounded" : "border border-[#cac9c9] focus:border-[#cac9c9]")} />
                    </div>
                    <div class="flex flex-col mt-2 gap-5 p-2">
                        <label>
                            Socials
                        </label> 
                        <input type="text" class={joinClass("input focus:outline-none", theme() === "dark" ? "border border-[#464646] rounded" : "border border-[#cac9c9] focus:border-[#cac9c9]")}
                            value={api.authStore.model.social}
                            onChange={(e) => setSocial(e.currentTarget.value)}
                        />
                    </div>
                    <div class="flex flex-col mt-2 gap-5 p-2">
                        <label>
                            Deactivate Account
                        </label>
                        <p>
                            Hide account from others, dont worry your data is not going to be deleted
                        </p>
                        <input type="checkbox" checked={deactivated()}   onChange={()=> setDeactivated(!deactivated())} class="toggle rounded-xl mb-12" />
                         
                     </div>
                </div>
            </div>
        </dialog>
    )
}
