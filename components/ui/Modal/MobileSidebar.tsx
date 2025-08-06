import { api } from "@/src"
import Modal from "../Modal"
import Scissors from "../Icons/Scissors"
import User from "../Icons/User"
 
export default function MobileSidebar() {
    return(
        <Modal id="modalMobile" className="w-64">
         
          <Modal.Content className="p-2 text-lg">
            <div class="flex flex-col gap-2"> 
                <div class="mt-5">
                    <div class="flex flex-row hero  gap-12">
                        <User class="w-7 h-7"/>
                        <p class="font-bold" >Profile</p>
                    </div>
                </div>
            </div>
          </Modal.Content>
        </Modal>
    )
}