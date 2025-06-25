"use client"

import { api } from "@/src" 
import useNavigation from "@/src/Utils/Hooks/useNavigation"
import useTheme from "@/src/Utils/Hooks/useTheme"
import { joinClass } from "@/src/Utils/Joinclass"
import Page from "@/src/Utils/Shared/Page"


export default function Password() { 
 
  const { params, route, navigate, goBack } = useNavigation("/settings");
  const { theme } = useTheme()

  const resetCache = () => {
    api.resetCache()
  }

  const settingsOptions = [
    {
      title: "Current Password",
      description:
        "See your account info, username, dob, email etc",
      icon: (
        <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
      path: "/settings/account-management/account",
    },
    {
      title: " Change Your Password",
      description:
        "Change your password, keep your account secure",
      icon: (
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
</svg>

      ),
      path: "/settings/security",
    },
    {
      title: "Download an Archive of your data",
      description: "Request an archive of data",
      icon: (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
</svg>

      ),
      path: "/settings/monetization",
    },
    {
      title: "Delete your account",
      description: "Find out how to fully delete your account",
      icon: (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>

      ),
      path: "/settings/premium",
    },
     
  ]

  return (
    <Page  {...{ navigate, params, route: route }} >
         <div class={joinClass("min-h-screen  ", 
        theme() == "dark" ? "bg-black text-white" : "bg-white text-black"
    )}> 
      {/* Header */}
      <div class="flex items-center px-4 py-3">
        <button onClick={goBack} class="mr-4">
          <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div class="flex-1 text-center">
          <h1 class="text-xl font-bold">Update Password</h1>
          <p class="text-gray-500 text-sm">@{api.authStore.model.username}</p>
        </div>
        <div class="w-6"></div>
      </div>

      

      {/* Settings Options */}
      <div class="px-4 space-y-0">
       <div 
            onClick={()=> navigate(option.path)}
            class={joinClass("flex items-start py-4 cursor-pointer  transition-colors -mx-4 px-4   " )}
          > 
            <div class="flex-1">
              <h3 class="text-lg mb-1 flex justify-between ">Current Password  <input placeholder="Current password"  class="focus:outline-none bg-transparent "></input></h3> 
              <a href="/auth/ForgotPassword" class="text-blue-500 text-sm ">Forgot Password?</a>
            </div>
            
          </div>
             <div  
            class={joinClass("flex items-start py-4 cursor-pointer    ")}
          > 
            <div class="flex-1">
              <h3 class="text-lg flex justify-between mb-1">New Password  <input placeholder="Atleast 8 Characters" class="focus:outline-none bg-transparent "></input></h3>
            </div>
            
            
          </div>
          
         <div  
            class={joinClass("flex items-start py-4 cursor-pointer  -mx-4 px-4  ")}
          > 
            <div class="flex-1">
              <h3 class=" flex justify-between text-lg mb-1">Confirm    <input placeholder="Atleast 8 Characters" class="focus:outline-none bg-transparent "></input></h3>
            </div>
            
            
          </div>
      </div>
      

       

       
    </div>
    </Page>
  )
}
