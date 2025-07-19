import { createEffect, For, Show } from "solid-js";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import { api } from "@/src";
import ArrowLeft from "../Icons/ArrowLeft";
import useNavigation from "@/src/Utils/Hooks/useNavigation";

"use client"
 

interface User {
  id: string
  username: string
  avatar?: string
  expand?: {
    following?: User[]
  }
}

interface FollowingListModalProps {
  user: () => User | null
  show: () => boolean
  setFollowing: (followers: User[]) => void
  setShow: (show: boolean) => void
  setUser: (user: User | null) => void
  currentUserId?: string
  onNavigate?: (username: string) => void
}

export default function FollowingListModal(props: FollowingListModalProps) {
  createEffect(() => {
    if (props.show()) {
      // Dispatch custom event when modal opens
      window.dispatchEvent(new CustomEvent("hide-post-button"))
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  })

  const handleClose = () => props.setShow(false)

  const handleNavigate = (username: string) => {
    props.onNavigate?.(username)
    handleClose()
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const followingList = () => props.user()?.expand?.following || []
  const isOwnProfile = () => props.user()?.id === props.currentUserId

  return (
    <Show when={props.show() && props.user()}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <div class="relative w-full max-w-md max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div class="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <button
                onClick={handleClose}
                class="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  class="w-5 h-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white text-center flex-1 mx-4">
                {isOwnProfile() ? "Following" : `${props.user()?.username}'s Following`}
              </h2>
              <div class="w-9" /> {/* Spacer for centering */}
            </div>
          </div>

          {/* Content */}
          <div class="overflow-y-auto max-h-[calc(85vh-80px)]">
            <Show
              when={followingList().length > 0}
              fallback={
                <div class="flex flex-col items-center justify-center py-16 px-6">
                  <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p class="text-gray-500 dark:text-gray-400 text-center text-lg">
                    {isOwnProfile()
                      ? "You don't follow anyone yet - start following people to see them here"
                      : `${props.user()?.username} doesn't follow anyone yet`}
                  </p> 
                </div>
              }
            >
              <div class="p-4 space-y-2">
                <For each={followingList()}>
                  {(following) => (
                    <button
                      onClick={() => handleNavigate(following.username)}
                      class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                    >
                      {/* Avatar */}
                      <div class="relative">
                        <Show
                          when={following.avatar}
                          fallback={
                            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all duration-200">
                              {following.username[0].toUpperCase()}
                            </div>
                          }
                        >
                          <img
                            src={api.cdn.getUrl("users", following.id, following.avatar as string)}
                            alt={`${following.username}'s avatar`}
                            class="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all duration-200"
                          />
                        </Show>
                      </div>

                      {/* User Info */}
                      <div class="flex-1 text-left">
                        <p class="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {following.username}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <svg
                        class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}
