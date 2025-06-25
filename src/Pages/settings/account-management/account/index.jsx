"use client"

import { api } from "@/src" 
import useNavigation from "@/src/Utils/Hooks/useNavigation"
import useTheme from "@/src/Utils/Hooks/useTheme"
import { joinClass } from "@/src/Utils/Joinclass"
import Page from "@/src/Utils/Shared/Page"


export default function Account() { 
 
  const { params, route, navigate, goBack } = useNavigation("/settings");
  const { theme } = useTheme()

  const resetCache = () => {
    api.resetCache()
  }

  const settingsOptions = [
    {
      title: "Username",
      description:
        `@${api.authStore.model.username}`,
        onClick: ()=> {
            document.getElementById("editAccountModal").showModal();
            window.dispatchEvent(new CustomEvent("modal-for", {
                detail:"Update Username"
            }))
        },
      icon: (
         <p>
             <span> {api.authStore.model.username}</span>
            <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
         </p>
      ),
      path: "/settings/account-management",
    },
    {
      title: "Email",
       onClick: ()=> {
            document.getElementById("editAccountModal").showModal();
            window.dispatchEvent(new CustomEvent("modal-for", {
                detail:"Change Email"
            }))
        },
      description:
       `${api.authStore.model.email}`,
      icon: (
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
</svg>

      ),
      path: "/settings/security",
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
          <h1 class="text-xl font-bold">Account</h1>
          <p class="text-gray-500 text-sm">@{api.authStore.model.username}</p>
        </div>
        <div class="w-6"></div>
      </div>

      

      {/* Settings Options */}
      <div class="px-4 space-y-0">
        {settingsOptions.map((option) => (
          <div
            key={option.title}
            onClick={option.onClick}
            class={joinClass("flex items-start py-4 cursor-pointer  transition-colors -mx-4 px-4" , theme() == "dark" ? "hover:bg-gray-900" : "hover:bg-base-300")}
          > 
            <div class="flex-1">
              <h3 class="font-bold text-lg mb-1">{option.title}</h3>
              <p class="text-gray-400 text-sm leading-relaxed">{option.description}</p>
            </div>
            <div class="ml-4 mt-2">
              <svg viewBox="0 0 24 24" class="w-5 h-5 text-gray-500" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

       

      <button class="text-red-500 text-center justify-center flex items-center mx-auto mt-5 font-bold" onClick={()=> api.authStore.logout(true)}> Log Out</button>   
    </div>

    </Page>
  )
}
