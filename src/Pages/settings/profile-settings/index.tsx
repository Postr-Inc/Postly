import { api } from "@/src";
import ArrowLeft from "@/src/components/Icons/ArrowLeft";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import Page from "@/src/Utils/Shared/Page";
import { createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
export default function () {

    const { params, route, navigate, goBack } = useNavigation("/settings");
    const { theme, toggleTheme } = useTheme()
    const [profile, setProfile] = createSignal(api.authStore.model);
    function updateProfile() {}
    function hasUnsavedChanges() {
        return (
            profile().username !== api.authStore.model?.username
            ||  profile().avatar !== api.authStore.model?.avatar
            || profile().banner !== api.authStore.model?.banner
        );
    }
    return (
        <Page  {...{ navigate, params, route: route }} id={crypto.randomUUID()} hide={['bottomNav']} >
            <div class="flex flex-col w-full h-full p-5">
                <div class="flex flex-row  hero justify-between gap-2">
                     <ArrowLeft class={`
                                        w-6 hero h-6 cursor-pointer font-bold   `} onClick={() => goBack()} />
                    <h1 class="text-2xl hero  ">Account Management</h1>
                    <div></div>
                </div>

 
            </div>
            
                <div class="mt-12 flex  flex-col"> 
                  
                     
                     
                    <div class="flex flex-col p-5 gap-2">
                        <label class="label">
                            <span class="label-text">
                                Allow Smart Data Collection
                            </span>
                        </label>
                        <div class="form-control flex gap-5">
                            <label class="label cursor-pointer gap-5">
                                <span class="label-text
                                    text-sm text-gray-500">
                                    Allow postly to gather metrics, to optimize your feed based on engagement and interactions. This data is not used outside of Postly, and is not sold to third parties.
                                    You can disable this feature anytime!
                                </span>
                                 
                            </label>
                            <input type="checkbox" class="toggle rounded-xl toggle-primary" checked={api.authStore.model?.smartDataCollection} onChange={(e) => {
                                    setProfile({ ...profile(), smartDataCollection: e.currentTarget.checked });
                            }} />
                         
                        </div>
        
                    </div>
                    <div class="flex flex-col p-5 gap-2">
                        <label class="label">
                            <span class="label-text">
                                Postly Plus
                            </span>
                        </label>
                        <div class="form-control">
                            <label class="label cursor-pointer gap-5">
                                <span class="label-text">
                                    Postly Plus is a premium subscription that allows you to access exclusive features, such as advanced analytics, custom themes, and more.
                                    <br />
                                    <span class="text-sm text-gray-500">Currently, Postly Plus is free for all users.</span>
                                </span>
                                
                            </label>
                        </div>
                    </div>
                    <div class="flex flex-col p-5 gap-2">
                        <label class="label">
                            <span class="label-text">
                                Password
                            </span>
                        </label>
                         <button class="btn  bg-blue-500 text-white rounded-xl w-full" onClick={() => {
                            navigate("/auth/ForgotPassword");
                        }}>
                            Request Password Reset
                        </button>
        
                    </div>
                    <div class="flex flex-col p-5 gap-2">
                        <label class="label">
                            <span class="label-text
                                ">
                                Delete Account
                            </span>
                        </label>
                        <div class="form-control">
                            <label class="label cursor-pointer gap-5">
                                <span class="label-text
                                    text-sm text-gray-500">
                                    Deleting your account will remove all your data from Postly, including your posts, comments, and likes. This action is irreversible.
                                    <br />
                                    <span class="text-red-500">This action cannot be undone.</span>
                                </span>
                                <button class="btn rounded-xl text-white btn-error" onClick={() => {
                                    //@ts-ignore
                                    document.getElementById("deleteModalConfirm").showModal(); 
                                }}>
                                    Delete Account
                                </button>
                            </label>
                        </div>
                    </div>

                </div>
                {
                    hasUnsavedChanges() && (
                        <div class="flex flex-col w-full p-5 gap-5">
                            <button class="btn w-full p-5 bg-blue-500 text-white" onClick={updateProfile}>
                                Save Profile Changes
                            </button>
                            <button class="btn w-full p-5 bg-base-200" onClick={() => {
                                setProfile(api.authStore.model);
                            }
                            }>
                                Discard Changes
                            </button>
                        </div>
                    )
                }
        </Page>
    )
}