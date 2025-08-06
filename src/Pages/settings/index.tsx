"use client";

import { api } from "@/src";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import Page from "@/components/ui/Page";
export default function SettingsPage() {
  const { params, route, navigate, goBack } = useNavigation("/settings");
  const { theme } = useTheme() as { theme: () => string };

  const resetCache = () => {
    api.resetCache();
  };

  const settingsOptions = [
    {
      title: "Your account",
      description:
        "See information about your account, download an archive of your data, or learn about your account deactivation options.",
      icon: (
        <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
      path: "/settings/account-management",
    },
    {
      title: "Security and account access",
      description:
        "Manage your account's security and keep track of your account's usage including apps that you have connected to your account.",
      icon: (
        <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
          <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11C15.4,11 16,11.4 16,12V16C16,16.6 15.6,17 15,17H9C8.4,17 8,16.6 8,16V12C8,11.4 8.4,11 9,11V10C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9.2 10.2,10V11H13.8V10C13.8,9.2 12.8,8.2 12,8.2Z" />
        </svg>
      ),
      path: "/settings/security",
    },
    {
      title: "Monetization",
      description:
        "See how you can make money on postly and manage your monetization options.",
      icon: (
        <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
          <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
        </svg>
      ),
      path: "/settings/monetization",
    },
    {
      title: "Postly Plus",
      description:
        "Manage your subscription features including Undo post timing.",
      icon: (
        <img
          src="/icons/icon_transparent.png"
          class={joinClass("w-6 h-6", theme() == "dark" ? "white" : "black")}
        />
      ),
      path: "/settings/premium",
    },
    {
      title: "My Feed",
      description: "Configure your your feed appearance and interactions",
      icon: (
        <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
        </svg>
      ),
      path: "/settings/timeline",
    },
    {
      title: "Privacy and safety",
      description: "Manage what information you see on Postly",
      icon: (
        <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
          <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
        </svg>
      ),
      path: "/settings/privacy",
    },
    {
      title: "Notifications",
      description:
        "Select the kinds of notifications you get about your activities, interests, and recommendations.",
      icon: (
        <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
      ),
      path: "/settings/notifications",
    },
  ];

  return (
    <Page {...{ navigate, params, route: route, hide: "bottomNav" }}>
      <div
        class={joinClass(
          "min-h-screen  ",
          theme() == "dark" ? "bg-black text-white" : "bg-white text-black",
        )}
      >
        {/* Header */}
        <div class="flex items-center px-4 py-3">
          <button onClick={goBack} class="mr-4">
            <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div class="flex-1 text-center">
            <h1 class="text-xl font-bold">Settings</h1>
            <p class="text-gray-500 text-sm">@{api.authStore.model.username}</p>
          </div>
          <div class="w-6"></div>
        </div>

        {/* Search Bar */}
        <div class="px-4 mb-6">
          <div
            class={joinClass(
              "rounded-full px-4 py-3 flex items-center",
              theme() == "dark" ? "bg-gray-800" : "bg-base-300",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              class="w-5 h-5 text-gray-500 mr-3"
              fill="currentColor"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              placeholder="Search settings"
              class={joinClass(
                "bg-transparent   outline-none flex-1",
                theme() == "dark" ? "text-gray-400 placeholder-gray-500" : "",
              )}
            />
          </div>
        </div>

        {/* Settings Options */}
        <div class="px-4 space-y-0">
          {settingsOptions.map((option) => (
            <div
              onClick={() => navigate(option.path)}
              class={joinClass(
                "flex items-start py-4 cursor-pointer  transition-colors -mx-4 px-4",
                theme() == "dark" ? "hover:bg-gray-900" : "hover:bg-base-300",
              )}
            >
              <div class="mr-4 mt-1 text-gray-400">{option.icon}</div>
              <div class="flex-1">
                <h3 class="font-bold text-lg mb-1">{option.title}</h3>
                <p class="text-gray-400 text-sm leading-relaxed">
                  {option.description}
                </p>
              </div>
              <div class="ml-4 mt-2">
                <svg
                  viewBox="0 0 24 24"
                  class="w-5 h-5 text-gray-500"
                  fill="currentColor"
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Reset Cache Button */}
        <div class="px-4 py-6">
          <button
            onClick={resetCache}
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full transition-colors"
          >
            Reset Cache
          </button>
        </div>
      </div>
    </Page>
  );
}
