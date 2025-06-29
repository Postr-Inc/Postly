"use client"

import { api } from "@/src" 
import useNavigation from "@/src/Utils/Hooks/useNavigation"
import useTheme from "@/src/Utils/Hooks/useTheme"
import { joinClass } from "@/src/Utils/Joinclass"
import Page from "@/src/Utils/Shared/Page"


export default function SettingsPage() { 
 
  const { params, route, navigate, goBack } = useNavigation("/settings");
  const { theme } = useTheme()

  const resetCache = () => {
    api.resetCache()
  }

  const settingsOptions = [
    {
      title: "Manage subscription",
      description:
        "Keep track of your past and current purchases",
      path: "/settings/premium/subscription",
    },
    {
      title: "Manage premium credits",
      description:
        "Keep track of currently stored items",
      path: "/settings/premium/credits",
    },
    {
      title: "Billing",
      description: "Modify billing information",
      path: "/settings/premium/billing",
    },
    {
      title: "Manage premium features",
      description:
        "Modify premium features settings",
      path: "/settings/premium/features",
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
          <h1 class="text-xl font-bold">Your Account</h1>
          <p class="text-gray-500 text-sm">@{api.authStore.model.username}</p>
        </div>
        <div class="w-6"></div>
      </div>

      

      {/* Settings Options */}
      <div class="px-4 space-y-0">
        {settingsOptions.map((option) => (
          <div 
            onClick={()=> navigate(option.path)}
            class={joinClass("flex items-start py-4 cursor-pointer  transition-colors -mx-4 px-4" , theme() == "dark" ? "hover:bg-gray-900" : "hover:bg-base-300")}
          >
            <div class="mr-4 mt-1 text-gray-400">{option.icon}</div>
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

       

       
    </div>
    </Page>
  )
}
