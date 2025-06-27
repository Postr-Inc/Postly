import { createSignal, onMount, Show } from "solid-js"

interface AlertPayload {
  message: string
  type?: "success" | "error" | "warning" | "info"
  title?: string
}

export default function CustomAlertDialog() {
  const [_alert, setAlert] = createSignal<AlertPayload | null>(null, {
    equals: false,
  })
  const [isVisible, setIsVisible] = createSignal(false)
  const [isExiting, setIsExiting] = createSignal(false)

  let timeoutId: NodeJS.Timeout | null = null

  onMount(() => {
    const handler = (e: CustomEvent<AlertPayload>) => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      setAlert(e.detail)
      setIsVisible(true)
      setIsExiting(false)

      // Auto-dismiss after 4 seconds (except for errors)
      if (e.detail.type !== "error") {
        timeoutId = setTimeout(() => {
          dismissAlert()
        }, 4000)
      }else{
        timeoutId = setTimeout(() => {
          dismissAlert()
        }, 6000)
      }
    }

    window.addEventListener("custom-alert", handler as EventListener)

    return () => {
      window.removeEventListener("custom-alert", handler as EventListener)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  })

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
      case "error":
      default:
        return "bg-red-500"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        )
      case "warning":
        return (
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
        )
      case "info":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
</svg>

        )
      case "error":
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
</svg>

        )
    }
  }

  const dismissAlert = () => {
    setIsExiting(true)
    setTimeout(() => {
      setAlert(null)
      setIsVisible(false)
      setIsExiting(false)
    }, 300) // Match the animation duration
  }

  const closeAlert = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    dismissAlert()
  }

  return (
    <Show when={_alert()}>
      <div
        class={`
          fixed top-4 left-1/2 sm:w-[20rem] xsm:w-[25rem] w-[20rem] transform -translate-x-1/2 z-[999999] transition-all duration-300 ease-out
          ${
            isExiting()
              ? "-translate-y-full opacity-0"
              : isVisible()
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
          }
        `}
      >
        <div
          class={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white max-w-md
            ${getAlertStyles(_alert()?.type || "error")}
          `}
        >
          <div class="flex-shrink-0">{getIcon(_alert()?.type || "error")}</div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{_alert()?.message || "An error occurred"}</p>
          </div>

          <div class="flex items-center gap-2">
            <Show when={_alert()?.type === "error"}>
              <button
                class="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors duration-200"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
            </Show>

            <button onClick={closeAlert} class="p-1 hover:bg-white/20 rounded-md transition-colors duration-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Show>
  )
}
