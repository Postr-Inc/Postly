"use client"

import { createSignal } from "solid-js"
import Page from "@/src/Utils/Shared/Page"
import useNavigation from "@/src/Utils/Hooks/useNavigation"
import { api } from "@/src"
const useTheme = () => ({
  theme: () => "light", // or "dark"
})

const joinClass = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ")

interface SettingItemProps {
  title: string
  description: string
  type?: "toggle" | "navigation"
  checked?: boolean
  onToggle?: () => void
  onClick?: () => void
  theme: string
}

function SettingItem(props: SettingItemProps) {
  const baseCardClass =
    "group flex items-start justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer"
  const hoverClass =
    props.theme === "dark" ? "hover:bg-gray-800/50 active:bg-gray-800/70" : "hover:bg-gray-50 active:bg-gray-100"

  return (
    <div
      class={joinClass(baseCardClass, hoverClass)}
      onClick={props.type === "navigation" ? props.onClick : undefined}
    >
      <div class="flex-1 space-y-1 pr-4">
        <h3 class="font-semibold text-base leading-tight">{props.title}</h3>
        <p class="text-sm text-gray-500 leading-relaxed">{props.description}</p>
      </div>

      {props.type === "toggle" && (
        <div class="flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              props.onToggle?.()
            }}
            class={joinClass(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              props.checked ? "bg-blue-600" : props.theme === "dark" ? "bg-gray-600" : "bg-gray-300",
            )}
            role="switch"
            aria-checked={props.checked}
          >
            <span
              class={joinClass(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                props.checked ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        </div>
      )}

      {props.type === "navigation" && (
        <div class="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  )
}

interface SectionProps {
  title: string
  children: any
}

function Section(props: SectionProps) {
  return (
    <div class="space-y-3">
      <h2 class="text-xs font-bold uppercase text-gray-400 tracking-wider px-4 mb-3">{props.title}</h2>
      <div class="space-y-1 px-4">{props.children}</div>
    </div>
  )
}

export default function Privacy() {
  const { params, route, navigate, goBack } = useNavigation("/settings")
  const { theme } = useTheme()
  const currentTheme = theme()
  const isDark = currentTheme === "dark"

  const [improveToggle, setImproveToggle] = createSignal(JSON.parse(localStorage.getItem("track_metrics") || "false"))
  const [personalizeToggle, setPersonalizeToggle] = createSignal(JSON.parse(localStorage.getItem("track_metrics_person") || "false"))
  const [contentFilterToggle, setContentFilterToggle] = createSignal(JSON.parse(localStorage.getItem("content_filtering") || "true"))

  return (
     <Page {...{ navigate, params, route, hide:"bottomNav" }}  >
  <div class={joinClass("min-h-screen transition-colors duration-200", isDark ? "bg-gray-900 text-white" : "")}>

    {/* Header */}
    <div class={joinClass("sticky top-0 z-10", isDark ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-200")}>
      <div class="flex items-center px-4 py-4">
        <button
          onClick={goBack}
          class={joinClass("mr-4 p-2 rounded-full", isDark ? "hover:bg-gray-800" : "hover:bg-gray-100")}
          aria-label="Go back"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex-1 text-center">
          <h1 class="text-xl font-bold">Privacy & Safety</h1>
          <p class="text-sm text-gray-500 mt-1">@{api.authStore.model.username}</p>
        </div>
        <div class="w-10" />
      </div>
    </div>

    {/* Content */}
    <div class="pb-8">
      <div class="space-y-8 pt-6">

        {/* Telemetry & Personalization */}
        <Section title="Telemetry & Personalization">
          <SettingItem
            title="Product Improvement"
            description="Allow Postly to collect metrics such as posts you like, comment, or interact with to improve your feed and experience."
            type="toggle"
            checked={improveToggle()}
            onToggle={() => {
              const newValue = !improveToggle()
              setImproveToggle(newValue)
              localStorage.setItem("track_metrics", JSON.stringify(newValue))
            }}
            theme={currentTheme}
          />
          <SettingItem
            title="Personalised Experience"
            description="Use telemetry to personalize features and content based on your interactions."
            type="toggle"
            checked={personalizeToggle()}
            onToggle={() => {
              const newValue = !personalizeToggle()
              setPersonalizeToggle(newValue)
              localStorage.setItem("track_metrics_person", JSON.stringify(newValue))
            }}
            theme={currentTheme}
          />
        </Section>

        {/* Sensitive Content */}
        <Section title="Sensitive Content & Filtering">
          <SettingItem
            title="Content Filtering"
            description="Hide sensitive or explicit media flagged by Postly. Foul language is not filtered."
            type="toggle"
            checked={contentFilterToggle()}
            onToggle={() => {
              const newValue = !contentFilterToggle()
              setContentFilterToggle(newValue)
              localStorage.setItem("content_filtering", JSON.stringify(newValue))
            }}
            theme={currentTheme}
          />
        </Section>

        {/* Divider */}
        <div class={joinClass("mx-4 border-t", isDark ? "border-gray-800" : "border-gray-200")} />

        {/* Data & Privacy Management */}
        <Section title="Data & Privacy Management">
          <SettingItem
            title="Request My Data"
            description="Download a copy of all your data stored on Postly."
            type="navigation"
            onClick={() => navigate("/settings/privacy/request-data")}
            theme={currentTheme}
          />
          <SettingItem
            title="Delete My Account"
            description="Permanently delete your account and all associated data."
            type="navigation"
            onClick={() => navigate("/settings/account/remove")}
            theme={currentTheme}
          />
          <SettingItem
            title="Privacy Policy"
            description="Read our full privacy policy to understand how we handle your data."
            type="navigation"
            onClick={() => window.open(`${window.location.host}/information/privacy.pdf`)}
            theme={currentTheme}
          />
        </Section>

        {/* Divider */}
        <div class={joinClass("mx-4 border-t", isDark ? "border-gray-800" : "border-gray-200")} />

        {/* Security & Protection */}
        <Section title="Security & Protection">
          <SettingItem
            title="Two-Factor Authentication"
            description="Enhance your account security with 2FA."
            type="navigation"
            onClick={() => navigate("/settings/security/two-factor")}
            theme={currentTheme}
          />
          <SettingItem
            title="Blocked Users"
            description="View and manage your blocked accounts."
            type="navigation"
            onClick={() => navigate("/settings/account-management/blocked-users")}
            theme={currentTheme}
          />
        </Section>

        {/* Divider */}
        <div class={joinClass("mx-4 border-t", isDark ? "border-gray-800" : "border-gray-200")} />

        {/* Safety Section */}
        <Section title="Safety">
          <SettingItem
            title="Safety Help Center"
            description="Learn how to protect your account and report issues."
            type="navigation"
            onClick={() => navigate("/safety")}
            theme={currentTheme}
          />
        </Section>
      </div>
    </div>
  </div>
</Page>

  )
}
