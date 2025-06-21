import useTheme from "@/src/Utils/Hooks/useTheme";
import Modal, { ModalContent } from "../Modal";
import { joinClass } from "@/src/Utils/Joinclass";
import { api } from "@/src";
export default function DeleteAccountModal() {
    const { theme } = useTheme()

    function deleteAccount(){
        api.authStore.deleteAccount()
    }
    return (
        <dialog id="deleteModalConfirm" class="modal overflow-scroll  flex flex-col gap-12 ">
            <div class={joinClass("modal-content   w-[22rem]  p-12   mt-12    rounded-xl", theme() === "dark" ? "bg-black" : "bg-white")}> 
            <div class="flex flex-col gap-12"> 
                 <p> Are you sure you want to delete your account? <br></br > <br></br>We recommend deactivating your account via your profile, it is a better alternative to hiding your account from everyone!
                Going forward and deleting your account is irreversable and can not be altered.</p>
                 <div classs="flex "> 
                 <button class="btn bg-blue-500 text-white" onClick={()=> document.getElementById("deleteModalConfirm").close()}>Cancel</button>
                 
                    <button class="btn bg-red-500 text-white">Confirm Deletion</button>
                 </div>
            </div>
            
            </div>
        </dialog>
    )
}
