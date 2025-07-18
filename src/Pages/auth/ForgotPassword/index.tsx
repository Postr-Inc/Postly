"use client"

import { createSignal, onMount } from "solid-js"
import logo from "@/src/assets/icon_transparent.png"
import Modal from "@/src/components/Modal"
import { api } from "@/src"
import { dispatchAlert } from "@/src/Utils/SDK"
import CustomAlertDialog from "@/src/Utils/Alerts/Alert"

export default function ForgotPassword() {
  const [token, setToken] = createSignal("")
  const [email, setEmail] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [confirmPassword, setConfirmPassword] = createSignal("")
  const [error, setError] = createSignal("")
  const [success, setSuccess] = createSignal("")
  const [loading, setLoading] = createSignal(false)

  onMount(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const urlToken = searchParams.get("token")
    if (urlToken) setToken(urlToken)
  })

  const getEmailProvider = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase()
    switch (domain) {
      case "gmail.com":
        return { name: "Gmail", url: "https://mail.google.com", color: "bg-red-500 hover:bg-red-600" }
      case "outlook.com":
      case "hotmail.com":
      case "live.com":
        return { name: "Outlook", url: "https://outlook.live.com", color: "bg-blue-500 hover:bg-blue-600" }
      case "yahoo.com":
        return { name: "Yahoo", url: "https://mail.yahoo.com", color: "bg-purple-500 hover:bg-purple-600" }
      case "icloud.com":
        return { name: "iCloud", url: "https://www.icloud.com/mail", color: "bg-gray-500 hover:bg-gray-600" }
      default:
        return { name: "Email", url: `https://${domain}`, color: "bg-slate-500 hover:bg-slate-600" }
    }
  }

  const EmailIcon = () => (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )

  async function requestReset() {
    if (!email()) {
      dispatchAlert({ message: "Please enter an email address.", type: "error" })
      return
    }
    setLoading(true)
    try {
      await api.authStore.requestPasswordReset(email())
      //@ts-ignore
      document.getElementById("resetPasswordModal")?.showModal()
      dispatchAlert({ message: "Password reset email sent! Check your inbox.", type: "success" })
      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      dispatchAlert({
        message: err?.message || "An error occurred. Please try again.",
        type: "error",
      })
    }
  }

  async function handleResetPassword() {
    setLoading(true)
    if (!password() || password() !== confirmPassword()) {
      dispatchAlert({ message: "Passwords must match and not be empty.", type: "error" })
      setLoading(false)
      return
    }
    try {
      await api.authStore.resetPassword(token(), password())
      setSuccess("Your password has been reset. You may now log in.")
      dispatchAlert({ message: "Password reset successful!", type: "success" })
      setLoading(false)
    } catch (err: any) {
      console.log(err)
      setLoading(false)
      dispatchAlert({ message: err.message, type: "error" })
    }
  }

  return (
    <div class="relative w-full p-6 xl:mt-8 justify-center flex flex-col gap-6 mx-auto xl:w-[28rem] lg:w-[32rem] md:w-[28rem]">
      <div class="flex justify-center mb-8">
        <img src={logo || "/placeholder.svg"} class="w-16 h-16" />
      </div>

      {!token() ? (
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h1 class="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
            <p class="text-sm text-muted-foreground">Enter your email address and we'll send you a reset link</p>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label
                for="email"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your email"
                autocomplete="email"
                onInput={(e) => setEmail(e.currentTarget.value)}
              />
            </div>

            <button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full bg-rose-500 hover:bg-rose-600 text-white"
              onClick={requestReset}
              disabled={loading()}
            >
              {loading() ? (
                <>
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <h1 class="text-2xl font-semibold tracking-tight">Reset your password</h1>
            <p class="text-sm text-muted-foreground">Enter your new password below</p>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label
                for="password"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter new password"
                onInput={(e) => setPassword(e.currentTarget.value)}
              />
            </div>

            <div class="space-y-2">
              <label
                for="confirm"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Confirm new password"
                onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              />
            </div>

            {success() && (
              <div class="rounded-md bg-green-50 p-4 border border-green-200">
                <div class="flex">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-green-800">{success()}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full text-white"
              classList={{
                "bg-green-500 hover:bg-green-600": !success(),
                "bg-blue-500 hover:bg-blue-600": success(),
              }}
              onClick={() => {
                if (!success()) {
                  handleResetPassword()
                } else {
                  window.location.href = "/auth/login"
                }
              }}
              disabled={loading()}
            >
              {loading() ? (
                <>
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetting...
                </>
              ) : !success() ? (
                "Reset password"
              ) : (
                "Continue to login"
              )}
            </button>
          </div>
        </div>
      )}

      <Modal id="resetPasswordModal">
        <div class="p-6 space-y-6 max-w-md mx-auto">
          <div class="text-center space-y-4">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div class="space-y-2">
              <h3 class="text-lg font-semibold">Check your email</h3>
              <p class="text-sm text-muted-foreground">We've sent a password reset link to</p>
              <p class="text-sm font-medium text-foreground">{email()}</p>
            </div>
          </div>

          <div class="space-y-3">
            <button
              class={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full text-white ${getEmailProvider(email()).color}`}
              onClick={() => window.open(getEmailProvider(email()).url, "_blank")}
            >
              <EmailIcon />
              <span class="ml-2">Open {getEmailProvider(email()).name}</span>
            </button>

            <button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
              onClick={() => {
                //@ts-ignore
                document.getElementById("resetPasswordModal")?.close()
              }}
            >
              I'll check later
            </button>
          </div>

          <div class="text-center">
            <p class="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                class="text-primary hover:underline font-medium"
                onClick={() => {
                  //@ts-ignore
                  document.getElementById("resetPasswordModal")?.close()
                  requestReset()
                }}
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </Modal>

      <CustomAlertDialog />
    </div>
  )
}
