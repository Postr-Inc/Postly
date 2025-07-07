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
        <div class="space-y-4">
        {/* Cashout Options */}
        <div class="flex flex-col p-4 space-y-4">
          <h2 class="text-lg font-semibold">Cashout Options</h2>
          <div class="flex items-center justify-between">
            <span>Current Balance: $0.00</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Cashout via PayPal</span>
            <button class="btn text-white bg-blue-500 rounded-xl" >Connect</button>
          </div>
          <div class="flex items-center justify-between">
            <span>Cashout via Bank Transfer</span>
            <button class="btn text-white bg-blue-500 rounded-xl">Setup</button>
          </div>
          <div class="flex items-center justify-between">
            <span>Cashout via Cryptocurrency</span>
            <button class="btn text-white bg-blue-500 rounded-xl">Add Wallet</button>
          </div>
        </div>

        <div class="flex items-center justify-center">
          <button class="btn text-white bg-green-500 rounded-xl" disabled={false}>Cashout $0.00</button>
        </div>

        </div>
      </div>

       

       
    </div>
    </Page>
  )
}
