"use client"

import useTheme from "../../Utils/Hooks/useTheme"
import { api } from "../.."
import { joinClass } from "@/src/Utils/Joinclass"
import { type Accessor, createSignal, Show, For } from "solid-js"
import useScrollingDirection from "@/src/Utils/Hooks/useScrollingDirection"
import useDevice from "@/src/Utils/Hooks/useDevice"
import { Portal } from "solid-js/web"
import LogoutModal from "@/src/Utils/Modals/LogoutModal"
import Bookmark from "../Icons/Bookmark"
import Settings from "../Icons/Settings"

// Enhanced SVG Icons with better styling
const BookmarkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
)

const SettingsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 0-8 0m8 8a4 4 0 0 0-8 0M5 8a4 4 0 0 0 8 0M5 16a4 4 0 0 0 8 0" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const PlusIcon = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    {...props}
  >
    <path d="M12 5v14m-7-7h14" />
  </svg>
)

const SparkleIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" {...props}>
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
</svg>

)

const FireIcon = (props: any) => (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  {...props}>
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
</svg>

)

const HeartIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke-width="0" {...props}>
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
  </svg>
)

export default function HomeNav({
  navigate,
  page,
  swapFeed,
}: {
  navigate: any
  page: Accessor<string>
  swapFeed: any
}) {
  const { theme } = useTheme()
  const { scrollingDirection } = useScrollingDirection()
  const { mobile } = useDevice()

  const [hide, setHide] = createSignal(false)
  const [showUserMenu, setShowUserMenu] = createSignal(false)

  // Mock subscribed topics
  const [subscribedTopics, setSubscribedTopics] = createSignal([

  ])

  const defaultTabs = [
    {
      key: "recommended",
      label: "For You",
      icon: SparkleIcon,
    },
    {
      key: "following",
      label: "Following",
      requiresAuth: true,
      icon: HeartIcon,
    },
    {
      key: "trending",
      label: "Trending",
      icon: FireIcon,
    },
  ]

  const getTabClasses = (isActive: boolean, tab: any) => {
    if (isActive) {
      return  joinClass(" text-white    ", tab.key === "trending" ? "bg-red-400 dark:bg-red-500" : "bg-blue-500 dark:bg-blue-500" )
    }
    return "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
  }

  const getUserAvatar = () => {
    if (api.authStore.model?.avatar) {
      return api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar)
    }
    return "/icons/usernotfound/image.png"
  }

  return (
    <div
      class={joinClass(
        "sticky top-0 z-[99999]   w-full transition-all duration-300", 
        "shadow-sm",
        theme() === "dark" ? "dark bg-black text-white" : "bg-white/80 dark:bg-gray-900/80 ",
        hide() && mobile() ? "hidden" : "",
      )}
    >
      {/* Header Section */}
      <div class="w-full px-2 py-3">
        <div class="flex items-center justify-between max-w-full">
          {/* User Section */}
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="relative">
              <div class="dropdown focus:outline-none">
                <div tabindex="0" role="button" class={joinClass(
                  "flex items-center gap-3 p-2.5 focus:outline-none rounded-xl transition-all duration-200",
                  theme() === "dark" ? "border-gray-700" : "border-gray-300",
                )}> <img
                    src={getUserAvatar() || "/placeholder.svg"}
                    alt={api.authStore.model?.username || "User"}
                    class="w-12 h-12  focus:outline-none rounded-xl  object-cover"
                  /></div>
                <ul tabindex="0" class="dropdown-content focus:outline-none  menu bg-base-100 border rounded-box rounded-xl z-1 w-52 p-2 shadow-sm">
                 <Show when={api.authStore.model?.username}>
                   <li><a onClick={()=> navigate(`/u/${api.authStore.model?.username}`)}>Profile</a></li>
                   {api.authStore.model?.postr_plus && ( <li><a>Postly Plus Benefits</a></li>)}
                   {api.authStore.model?.username && (<li><a onClick={()=> api.authStore.logout(true)}>Logout</a></li>)}
                 </Show>
                 <Show when={!api.authStore.model?.username}>
                   <li><a onClick={() => requireSignup()}>Join The Community</a></li> 
                  </Show>
                </ul>
              </div>
 
            </div>
          </div>

          {/* Action Icons */}
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                if (!api.authStore.model?.username) {
                  
                  //@ts-ignore
                  requireSignup();
                  return
                }
                navigate("/bookmarks")
              }}
              class="p-2.5 rounded-xl transition-colors border  dark:border-gray-600 "
              title="Bookmarks"
            >
              <Bookmark class="w-5 h-5 text-blue-500 dark:text-blue-500" />
            </button>
            <button
              onClick={() => {
                if (!api.authStore.model?.username) {
                  //@ts-ignore
                  requireSignup();
                  return
                }
                navigate("/settings")
              }}
              class="p-2.5 rounded-xl  border   dark:border-gray-600"
              title="Settings"
            >
              <Settings class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div class="w-full px-2 pb-3">
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Default Tabs */}
          <For each={defaultTabs}>
            {(tab) => (
              <Show when={!tab.requiresAuth || api.authStore.model?.username}>
                <button
                  onClick={() => swapFeed(tab.key, 0)}
                  class={joinClass(
                    "flex items-center gap-2 btn btn-sm rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    "border border-gray-200 dark:border-gray-600",   
                    getTabClasses(page() === tab.key, tab),
                  )}
                >
                  <tab.icon class="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                  <Show when={page() === tab.key}>
                    <div class="w-2 h-2  rounded-full animate-pulse flex-shrink-0" />
                  </Show>
                </button>
              </Show>
            )}
          </For>

          {/* Subscribed Topics */}
          <Show when={api.authStore.model?.username && subscribedTopics().length > 0}>
            <div class="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-2 flex-shrink-0" />
            <For each={subscribedTopics()}>
              {(topic) => (
                <button
                  onClick={() => swapFeed(`topic-${topic.slug}`, 0)}
                  class={joinClass(
                    "flex items-center gap-2 btn btn-sm rounded-xl  font-medium text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    "border border-gray-200 dark:border-gray-600",
                    page() === `topic-${topic.slug}`
                      ? "bg-purple-600 dark:bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <span class="text-base flex-shrink-0">{topic.icon}</span>
                  <span>{topic.name}</span>
                  <Show when={page() === `topic-${topic.slug}`}>
                    <div class="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0" />
                  </Show>
                </button>
              )}
            </For>
          </Show>

          {/* Add Topic Button */}
          <Show when={api.authStore.model?.username}>
            <button
              onClick={() => navigate("/explore")}
              class={joinClass(
                " flex items-center gap-2 btn btn-sm rounded-xl  font-medium text-sm transition-all duration-200 whitespace-nowrap group flex-shrink-0",
                "bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-800/30",
                "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300",
                "border border-indigo-200 dark:border-indigo-700",
              )}
              title="Explore topics"
            >
              <PlusIcon class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 flex-shrink-0" />
              <span>Explore</span>
            </button>
          </Show>
        </div>
      </div>

      {/* Click outside to close user menu */}
      <Show when={showUserMenu()}>
        <div class="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      </Show>

      <Portal>
        <style>
          {`/* Enhanced animations and effects */
@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: animate-in 0.2s ease-out;
}

.slide-in-from-top-2 {
  animation: slide-in-from-top-2 0.2s ease-out;
}

@keyframes slide-in-from-top-2 {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* Gradient text effect */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass morphism effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
`}
        </style>
        <LogoutModal />
      </Portal>
    </div>
  )
}
