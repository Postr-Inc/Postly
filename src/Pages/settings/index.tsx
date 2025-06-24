import { api } from "@/src";
import ArrowLeft from "@/src/components/Icons/ArrowLeft";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import Page from "@/src/Utils/Shared/Page";
import { useParams } from "@solidjs/router";
export default function () {

    const { params, route, navigate, goBack } = useNavigation("/settings");
    const { theme, toggleTheme } = useTheme()
    return (
        <Page  {...{ navigate, params, route: route }} id={crypto.randomUUID()} hide={['bottomNav']} >
            <div class="flex flex-col w-full h-full p-5">
                <div class="flex flex-row  hero justify-between gap-2">
                    <ArrowLeft class={`
                    w-6 hero h-6 cursor-pointer font-bold   `} onClick={() => goBack()} />
                    <h1 class="text-2xl hero  ">Settings</h1>
                    <div></div>
                </div>

 
            </div>
            
                <div class="mt-12 flex  flex-col"> 
                    <div class="border border-base-200 cursor-pointer p-5 hover:bg-base-300"
                    onClick={()=>{
                        navigate('/settings/profile-settings')
                    }}
                    >
                        Account Settings
                    </div>
                    <div class="border border-base-200 cursor-pointer p-5 hover:bg-base-300"
                    onClick={()=> navigate("/settings/account-security")}
                    >
                        Account Security
                    </div>
                    <div class="border border-base-200 cursor-pointer p-5 hover:bg-base-300"
                    onClick={()=> navigate("/settings/device-management")}
                    >
                        Device Management
                    </div> 
                    
                    <div class="border border-base-200 cursor-pointer p-5 hover:bg-base-300"
                    onClick={()=> navigate("/settings/application-updates")}
                    >
                        Application Updates
                    </div> 
                    <div class="border border-base-200 cursor-pointer p-5 hover:bg-base-300"
                    onClick={()=> navigate("/settings/my-feed")}
                    >
                      My Feed
                    </div>
                   <div style={{padding: '20px'}}>
                      <button onClick={()=> {
                        api.resetCache()
                        window.location.reload()
                      }} class="btn  p-5  w-full bg-blue-500 text-white ">Reset Cache</button>
                   </div>
                </div>
        </Page>
    )
}