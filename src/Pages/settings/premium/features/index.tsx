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

  return (
    <Page {...{ navigate, params, route: route }}>
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
            <h1 class="text-xl font-bold">Your Account</h1>
            <p class="text-gray-500 text-sm">@{api.authStore.model.username}</p>
          </div>
          <div class="w-6"></div>
        </div>

        {/* Settings Options */}
        <div class="px-4 space-y-0">
          <div class="space-y-4">
            <h2 class="text-2xl font-bold">Undo Post Timings</h2>
            <p class="text-gray-500">
              Configure the undo post timings feature to give yourself a grace
              period to undo sent posts.
            </p>
            <form class="space-y-4">
              <div>
                <label
                  for="undoTime"
                  class="block text-sm font-medium text-gray-700"
                >
                  Undo Time (seconds)
                </label>
                <select
                  id="undoTime"
                  name="undoTime"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </select>
              </div>
              <button
                type="submit"
                class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </Page>
  );
}
