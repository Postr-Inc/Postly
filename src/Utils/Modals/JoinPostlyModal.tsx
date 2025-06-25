 import { createSignal, Show, onMount, onCleanup } from "solid-js"

interface RequireSignupModalProps {
  onSignup?: () => void
  onClose?: () => void
}

export default function RequireSignupModal(props: RequireSignupModalProps = {}) {
  const [visible, setVisible] = createSignal(false)
  const [isAnimating, setIsAnimating] = createSignal(false)

  // Globally accessible trigger
  onMount(() => {
    ;(window as any).requireSignup = () => {
      setVisible(true)
      //@ts-ignore
      window.hideBottomNav() 
      setIsAnimating(true)
    }
  })

  onCleanup(() => {
    delete (window as any).requireSignup
  })

  const handleSignup = () => {
    if (props.onSignup) {
      props.onSignup()
    } else {
      setVisible(false)
       //@ts-ignore
      document.getElementById("register").showModal()
    }
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setVisible(false)
      //@ts-ignore
      window.showBottomNav()
      props.onClose?.()
    }, 300)
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Handle escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose()
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown)
  })

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown)
  })

  // SVG Icons
  const StarIcon = (props: { class?: string }) => (
    <svg class={props.class} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )

  const UnlockIcon = (props: { class?: string }) => (
    <svg class={props.class} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  )

  const BarChartIcon = (props: { class?: string }) => (
    <svg class={props.class} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )

  const BrainIcon = (props: { class?: string }) => (
    <svg class={props.class} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v15A2.5 2.5 0 0 0 9.5 22h5a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 14.5 2h-5z" />
      <path d="M9 6h6" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
    </svg>
  )

  const GiftIcon = (props: { class?: string }) => (
    <svg class={props.class} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <polyline points="20,12 20,22 4,22 4,12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  )

  const CloseIcon = (props: { class?: string }) => (
    <svg class={props.class} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )

  const benefits = [
    {
      icon: StarIcon,
      text: "Early User Badge — visible on your profile",
      color: "text-yellow-500",
    },
    {
      icon: UnlockIcon,
      text: "Priority access to beta & experimental features",
      color: "text-blue-500",
    },
    {
      icon: BarChartIcon,
      text: "Advanced analytics and post insights",
      color: "text-green-500",
    },
    {
      icon: BrainIcon,
      text: "Inside scoop on our product roadmap",
      color: "text-purple-500",
    },
    {
      icon: GiftIcon,
      text: "Auto opt-in to Postly Plus when it rolls out",
      color: "text-pink-500",
    },
  ]

  // Demo functionality
  const [showDemoModal, setShowDemoModal] = createSignal(false)

  const triggerGlobalModal = () => {
    if ((window as any).requireSignup) {
      ;(window as any).requireSignup()
    }
  }

  return (
    <> 
      {/* Modal */}
      <Show when={visible()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          style={{
            "background-color": "rgba(0, 0, 0, 0.5)",
            animation: isAnimating() ? "fadeIn 0.3s ease-out" : "fadeOut 0.3s ease-in",
          }}
        >
          <div
            class="relative bg-white dark:bg-gray-900 rounded-2xl sm:h-[675px] sm:mt-24 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-md w-full"
            style={{
              animation: isAnimating() ? "modalEnter 0.3s ease-out" : "modalExit 0.3s ease-in",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div class="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <button
                onClick={handleClose}
                class="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close modal"
              >
                <CloseIcon class="w-5 h-5" />
              </button>

              <div class="text-center">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 hover:scale-110">
                  <div class="text-2xl">🚀</div>
                </div>

                <h2 class="text-xl font-bold mb-2">Unlock Full Access by Joining Early</h2>
                 
              </div>
            </div>

            {/* Benefits list */}
            <div class="p-6">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-4 text-center">
                What you'll get as an early member:
              </h3>

              <div class="space-y-3 mb-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:translate-x-1"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <benefit.icon class={`w-5 h-5 mt-0.5 ${benefit.color} flex-shrink-0`} />
                    <span class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div class="flex gap-3">
                <button
                  onClick={handleSignup}
                  class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 rounded-full transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={handleClose}
                  class="px-6 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Not Now
                </button>
              </div>

              {/* Trust indicators */}
              <div class="mt-4 text-center">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  ✨ Free forever • No credit card required • Join 1,000+ early users
                </p>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalExit {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
