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
          <h2 class="text-2xl font-bold">Privacy Policy</h2>
          <p class="text-gray-500">Last updated: January 1, 1970</p>
          <p>
            Postly is a social media app that allows users to post, share, and interact with content on the internet. In this privacy policy, we will outline how we collect, use, and protect the personal information of our users.
          </p>
          <h3>What information do we collect?</h3>
          <p>
            We collect information from you when you sign up for an account, log in, or interact with our app. This information may include your name, email address, phone number, and any other information that you may provide to us.
          </p>
          <h3>How do we use the information we collect?</h3>
          <p>
            We use the information we collect to provide our services to you and to improve the overall user experience. We may also use the information to contact you with updates, promotions, or other information that we think you may be interested in.
          </p>
          <h3>How do we protect your information?</h3>
          <p>
            We take the security of your information very seriously. We use appropriate technical and organizational measures to protect your information from unauthorized access, use, or disclosure. However, no security measure is 100% secure, and we cannot guarantee the security of your information.
          </p>
          <h3>What are your rights?</h3>
          <p>
            You have the right to request access to the information we collect about you, to request that we correct or delete any information that is inaccurate, and to object to the collection or processing of your information. You also have the right to withdraw your consent to our collection and use of your information.
          </p>
          <h3>How can you contact us?</h3>
          <p>
            If you have any questions or concerns about our privacy policy, or if you would like to exercise any of your rights, please contact us at <a href="mailto:privacy@postlyapp.com">privacy@postlyapp.com</a>.
          </p>
        </div>
      </div>

       

       
    </div>
    </Page>
  )
}
