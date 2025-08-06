"use client";

import { api } from "@/src";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import Page from "@/components/ui/Page";
import { createEffect, createSignal } from "solid-js";
interface AccountOptionProps {
  title: string;
  description: string;
  onClick: () => void;
  icon: any;
  theme: string;
}

function AccountOption(props: AccountOptionProps) {
  return (
    <div
      onClick={props.onClick}
      class={joinClass(
        "group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 border",
        props.theme === "dark"
          ? "border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 active:bg-gray-800/70"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100",
      )}
    >
      <div class="flex items-center space-x-4">
        <div
          class={joinClass(
            "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
            props.theme === "dark"
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-100 text-gray-600",
          )}
        >
          {props.icon}
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-base mb-1">{props.title}</h3>
          <p class="text-sm text-gray-500 leading-relaxed">
            {props.description}
          </p>
        </div>
      </div>
      <div class="text-gray-400 group-hover:text-gray-600 transition-colors">
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
}

export default function Account() {
  const { params, route, navigate, goBack } = useNavigation("/settings");
  const { theme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = createSignal(false);
  const [user, setUser] = createSignal(api.authStore.model);

  const currentTheme = theme();
  const isDark = currentTheme === "dark";

  const handleEditUsername = () => {
    const modal = document.getElementById(
      "editAccountModal",
    ) as HTMLDialogElement;
    modal?.showModal();
    window.dispatchEvent(
      new CustomEvent("modal-for", {
        detail: "Update Username",
      }),
    );
  };

  const handleEditEmail = () => {
    const modal = document.getElementById(
      "editAccountModal",
    ) as HTMLDialogElement;
    modal?.showModal();
    window.dispatchEvent(
      new CustomEvent("modal-for", {
        detail: "Email",
      }),
    );
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.authStore.logout(true);
    } finally {
      setIsLoggingOut(false);
    }
  };

  createEffect(() => {
    api.on("authChange", () => {
      setUser(JSON.parse(localStorage.getItem("postr_auth") as any));
    });
  });

  const accountOptions = [
    {
      title: "Username",
      description: `@${user().username}`,
      onClick: handleEditUsername,
      icon: (
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: "Email Address",
      description: api.authStore.model.email,
      onClick: handleEditEmail,
      icon: (
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <Page {...{ navigate, params, route }}>
      <div class={joinClass("min-h-screen transition-colors duration-200")}>
        {/* Header */}
        <div
          class={joinClass(
            "sticky top-0 z-10 backdrop-blur-md border-b transition-colors",
            isDark
              ? "bg-gray-900/80 border-gray-800"
              : "bg-white/80 border-gray-200",
          )}
        >
          <div class="flex items-center px-4 py-4">
            <button
              onClick={goBack}
              class={joinClass(
                "mr-4 p-2 rounded-full transition-colors duration-200",
                isDark
                  ? "hover:bg-gray-800 active:bg-gray-700"
                  : "hover:bg-gray-100 active:bg-gray-200",
              )}
              aria-label="Go back"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div class="flex-1 text-center">
              <h1 class="text-xl font-bold">Account Settings</h1>
              <p class="text-sm text-gray-500 mt-1">@{user().username}</p>
            </div>
            <div class="w-10" />
          </div>
        </div>

        {/* Profile Section */}
        <div class="px-4 pt-6 pb-4">
          <div
            class={joinClass(
              "flex items-center space-x-4 p-6 rounded-2xl border",
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            <div
              class={joinClass(
                "flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold",
                isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700",
              )}
            >
              {user().username.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold mb-1">@{user().username}</h2>
              <p class="text-gray-500">{api.authStore.model.email}</p>
            </div>
          </div>
        </div>

        {/* Account Options */}
        <div class="px-4 space-y-3">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Account Information
          </h3>
          {accountOptions.map((option) => (
            <AccountOption
              key={option.title}
              title={option.title}
              description={option.description}
              onClick={option.onClick}
              icon={option.icon}
              theme={currentTheme}
            />
          ))}
        </div>

        {/* Additional Settings */}
        <div class="px-4 mt-8 space-y-3">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Data & Privacy
          </h3>
          <AccountOption
            title="Clear Cache"
            description="Clear app cache and temporary data"
            onClick={() => api.resetCache()}
            theme={currentTheme}
            icon={
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            }
          />
        </div>

        {/* Logout Button */}
        <div class="px-4 mt-12 pb-8">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut()}
            class={joinClass(
              "w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-all duration-200",
              "border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 active:bg-red-100",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isDark &&
                "border-red-800 text-red-400 hover:bg-red-900/20 hover:border-red-700 active:bg-red-900/30",
            )}
          >
            {isLoggingOut() ? (
              <>
                <svg
                  class="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Page>
  );
}
