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
        <h2 class="text-2xl font-bold">Monetization Metrics</h2>
        
        <div class="bg-gray-100 p-4 rounded-md shadow">
          <h3 class="font-semibold">Total Earnings</h3>
          <p class="text-lg">$1,234.56</p>
        </div>

        <div class="bg-gray-100 p-4 rounded-md shadow">
          <h3 class="font-semibold">Monthly Subscribers</h3>
          <p class="text-lg">150</p>
        </div>

        <div class="bg-gray-100 p-4 rounded-md shadow">
          <h3 class="font-semibold">Active Campaigns</h3>
          <p class="text-lg">3</p>
        </div>

        <div class="bg-gray-100 p-4 rounded-md shadow">
          <h3 class="font-semibold">Ad Revenue</h3>
          <p class="text-lg">$789.00</p>
        </div>
      </div>

      </div>

       

       
    </div>
    </Page>
  )
}
