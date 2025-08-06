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
            <h2 class="text-2xl font-bold">Subscription</h2>
            <p class="text-gray-500">
              Adjust your subscription settings and view your past and current
              subscriptions.
            </p>
            <form class="space-y-4">
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={api.authStore.model.email}
                  disabled
                />
              </div>
              <div>
                <label
                  for="newsletter"
                  class="block text-sm font-medium text-gray-700"
                >
                  Newsletter
                </label>
                <div class="mt-1">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      class="mr-2 rounded-md focus:ring-blue-500"
                      checked={api.authStore.model.newsletter}
                      onChange={(e) =>
                        api.authStore.update({ newsletter: e.target.checked })
                      }
                    />
                    <span class="text-sm text-gray-700">
                      Receive the latest news and updates about Postly.
                    </span>
                  </label>
                </div>
              </div>
            </form>
            <div class="p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto">
              <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
                History
              </h2>

              <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-3">
                  Current Subscription
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div>
                    <p class="text-lg font-semibold text-blue-700">
                      Postly Premium
                    </p>
                    <p class="text-sm text-gray-600">
                      Active for <span class="font-medium">12 months</span>
                    </p>
                  </div>
                  <div class="text-left md:text-right">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg
                        class="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      Active
                    </span>
                    <p class="text-sm text-gray-500 mt-1">
                      Purchased: 2022-01-01
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-800 mb-3">
                  Past Subscriptions
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <p class="text-lg font-semibold text-gray-700">
                      Postly Premium
                    </p>
                    <p class="text-sm text-gray-600">
                      Subscription for <span class="font-medium">6 months</span>
                    </p>
                  </div>
                  <div class="text-left md:text-right">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <svg
                        class="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      Expired
                    </span>
                    <p class="text-sm text-gray-500 mt-1">
                      Purchased: 2021-06-01
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
