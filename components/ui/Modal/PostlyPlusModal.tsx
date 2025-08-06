"use client"

import { createSignal, For, Show } from "solid-js"

export default function PostlyPlusModal() {
  const [selectedTier, setSelectedTier] = createSignal("plus")
  const [billingPeriod, setBillingPeriod] = createSignal("monthly")

  const openDialog = () => {
    const dialog = document.getElementById("postly_plus") as HTMLDialogElement
    dialog?.showModal()
  }

  const closeDialog = () => {
    const dialog = document.getElementById("postly_plus") as HTMLDialogElement
    dialog?.close()
  }
 
  const tiers = {
    free: {
      name: "Postly Core",
      monthlyPrice: 0,
      annualPrice: 0,
      badge: "Free Tier",
      features: [
        "Unlimited posts and comments",
        "Media uploads (standard size limit)",
        "DMs (basic functionality)",
        "Explore, hashtag trends, and topic feeds",
        "Basic profile insights (likes, views)",
        "Custom profile themes (limited templates)",
        "Safety and privacy tools (full access)",
      ],
    },
    plus: {
      name: "Postly Plus",
      monthlyPrice: 4.99,
      annualPrice: 49.99,
      annualSavings: "SAVE 17%",
      badge: "Experience Upgrade",
      features: [
        "Everything in Free, and",
        "Ad-free experience",
        "Undo Send (10s window)",
        "Post edit history (view yours)",
        "Extra profile themes",
        "Restore deleted posts within 7 days",
        "Slight media upload boost",
      ],
    },
    creator: {
      name: "Postly Creator",
      monthlyPrice: 12.99,
      annualPrice: 129.99,
      annualSavings: "SAVE 17%",
      badge: "For Publishers",
      features: [
        "Everything in Plus, and",
        "AI caption/prompt suggestions",
        "Smart post scheduling",
        "Link in bio page",
        "Advanced post insights", 
      ],
    },
    pro: {
      name: "Postly Pro",
      monthlyPrice: 29.99,
      annualPrice: 299.99,
      annualSavings: "SAVE 17%",
      badge: "Full Control",
      features: [
        "Everything in Creator, and",
        "Full data transparency panel",
        "API access (personal usage)",
        "Post automation rules",
        "Upload limits greatly increased",
        "Priority support",
      ],
    },
  }

  const comparisonFeatures = [
    { name: "Ads", free: "Standard ads", plus: "Ad-free", creator: "Ad-free", pro: "Ad-free" },
    { name: "Undo Send", free: false, plus: "10s window", creator: "10s window", pro: "10s window" },
    { name: "Post edit history", free: false, plus: "View yours", creator: "View yours", pro: "View yours" },
    {
      name: "Profile themes",
      free: "Limited templates",
      plus: "Extra themes",
      creator: "Extra themes",
      pro: "Extra themes",
    },
    { name: "Deleted post recovery", free: false, plus: "7 days", creator: "7 days", pro: "7 days" },
    {
      name: "Media upload boost",
      free: "Standard",
      plus: "Slight boost",
      creator: "Slight boost",
      pro: "Greatly increased",
    },
  ]

  const creatorFeatures = [
    { name: "AI suggestions", free: false, plus: false, creator: true, pro: true },
    { name: "Post scheduling", free: false, plus: false, creator: "Smart scheduling", pro: "Smart scheduling" },
    { name: "Link in bio", free: false, plus: false, creator: true, pro: true },
    { name: "Advanced insights", free: "Basic", plus: "Basic", creator: "Full analytics", pro: "Full analytics" },
    { name: "Filtered inbox", free: false, plus: false, creator: true, pro: true },
  ]

  const proFeatures = [
    { name: "Data transparency", free: false, plus: false, creator: false, pro: "Full panel" },
    { name: "API access", free: false, plus: false, creator: false, pro: "Personal usage" },
    { name: "Automation rules", free: false, plus: false, creator: false, pro: true },
    { name: "Priority support", free: false, plus: false, creator: false, pro: true },
  ]

  const CheckIcon = () => (
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  )

  const XIcon = () => (
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  const CloseIcon = () => (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  return (
     <dialog id="postly_plus" class="modal max-w-[100vw] max-h-[100vh] w-screen h-screen backdrop:bg-black/50">
        <div class="modal-box w-screen h-screen max-w-[100vw] max-h-[100vh] rounded-none p-0 overflow-hidden bg-white">
          <div class="flex flex-col w-full h-full relative overflow-y-auto">
            {/* Close button */}
            <button
              class="absolute top-4 left-4 z-50 inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 h-8 w-8"
              onClick={closeDialog}
            >
              <CloseIcon />
              <span class="sr-only">Close</span>
            </button>

            {/* Main content */}
            <div class="flex-1 flex flex-col items-center px-4 py-16 max-w-6xl mx-auto w-full">
              {/* Header */}
              <div class="text-center space-y-4 mb-8">
                <h1 class="text-4xl font-bold tracking-tight">Upgrade Your Postly Experience</h1>
                <p class="text-lg text-gray-600 max-w-2xl">
                  Choose the plan that fits your needs. From enhanced experience to full creator tools and data control.
                </p>
              </div>

              {/* Billing toggle */}
              <div class="flex items-center gap-4 mb-8 bg-gray-100 rounded-full p-1">
                <button
                  class={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    billingPeriod() === "annual" ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setBillingPeriod("annual")}
                >
                  Annual
                  <span class="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Best Value</span>
                </button>
                <button
                  class={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    billingPeriod() === "monthly" ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setBillingPeriod("monthly")}
                >
                  Monthly
                </button>
              </div>

              {/* Pricing tiers */}
              <div class="grid gap-4 lg:grid-cols-4 md:grid-cols-2 w-full mb-8 max-w-7xl">
                <For each={Object.entries(tiers)}>
                  {([key, tier]) => (
                    <div
                      class={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                        selectedTier() === key ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      } ${key === "free" ? "opacity-75" : ""}`}
                      onClick={() => setSelectedTier(key)}
                    >
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                          <div
                            class={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedTier() === key ? "border-blue-500 bg-blue-500" : "border-gray-300"
                            }`}
                          >
                            <Show when={selectedTier() === key}>
                              <CheckIcon />
                            </Show>
                          </div>
                          <div>
                            <h3 class="text-lg font-semibold">{tier.name}</h3>
                            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tier.badge}</span>
                          </div>
                        </div>
                        <Show when={selectedTier() === key}>
                          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckIcon />
                          </div>
                        </Show>
                      </div>

                      <div class="mb-4">
                        <div class="flex items-baseline gap-1">
                          <span class="text-3xl font-bold">
                            ${billingPeriod() === "monthly" ? tier.monthlyPrice : tier.annualPrice}
                          </span>
                          <span class="text-gray-500">
                            {tier.monthlyPrice === 0 ? "" : billingPeriod() === "monthly" ? "/ month" : "/ year"}
                          </span>
                        </div>
                        <Show when={billingPeriod() === "annual" && tier.annualPrice > 0}>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-sm text-gray-500">
                              ${Math.round((tier.annualPrice / 12) * 100) / 100} billed annually
                            </span>
                            <Show when={tier.annualSavings}>
                              <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {tier.annualSavings}
                              </span>
                            </Show>
                          </div>
                        </Show>
                      </div>

                      <ul class="space-y-2 text-sm">
                        <For each={tier.features}>
                          {(feature) => (
                            <li class="flex items-start gap-2">
                              <div class="text-green-500 mt-0.5 flex-shrink-0">
                                <CheckIcon />
                              </div>
                              <span>{feature}</span>
                            </li>
                          )}
                        </For>
                      </ul>
                    </div>
                  )}
                </For>
              </div>

              {/* Subscribe button */}
              <Show when={selectedTier() !== "free"}>
                <button class="w-full max-w-md bg-black hover:bg-gray-800 text-white rounded-full py-3 text-base font-medium mb-6 transition-colors">
                   {/**Subscribe to {tiers[selectedTier() as keyof typeof tiers].name} */}
                   Coming Soon 2025
                </button>
              </Show>

              {/* Legal text */}
              <p class="text-xs text-gray-500 text-center max-w-md mb-8">
                By subscribing, you agree to our{" "}
                <a href="#" class="text-blue-500 underline">
                  Terms of Service
                </a>
                . Subscriptions auto-renew until canceled.{" "}
                <a href="#" class="text-blue-500 underline">
                  Cancel anytime
                </a>
                , at least 24 hours prior to renewal to avoid additional charges.
              </p>

              {/* Feature comparison */}
              <div class="w-full max-w-7xl">
                <h2 class="text-2xl font-bold text-center mb-8">Compare plans & features</h2>

                {/* Experience Features */}
                <div class="mb-8">
                  <h3 class="text-lg font-semibold mb-4 bg-gray-50 p-4 rounded-t-lg">🔓 Experience Features</h3>
                  <div class="border border-gray-200 rounded-b-lg overflow-hidden">
                    <div class="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-sm">
                      <div></div>
                      <div class="text-center">Free</div>
                      <div class="text-center">Plus</div>
                      <div class="text-center">Creator</div>
                      <div class="text-center">Pro</div>
                    </div>
                    <For each={comparisonFeatures}>
                      {(feature, index) => (
                        <div class="grid grid-cols-5 gap-4 p-4 border-t border-gray-100 text-sm">
                          <div class="font-medium">{feature.name}</div>
                          <div class="text-center">
                            {typeof feature.free === "boolean" ? (
                              feature.free ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.free
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.plus === "boolean" ? (
                              feature.plus ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.plus
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.creator === "boolean" ? (
                              feature.creator ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.creator
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.pro === "boolean" ? (
                              feature.pro ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.pro
                            )}
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>

                {/* Creator Tools */}
                <div class="mb-8">
                  <h3 class="text-lg font-semibold mb-4 bg-gray-50 p-4 rounded-t-lg">🥈 Creator Tools</h3>
                  <div class="border border-gray-200 rounded-b-lg overflow-hidden">
                    <div class="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-sm">
                      <div></div>
                      <div class="text-center">Free</div>
                      <div class="text-center">Plus</div>
                      <div class="text-center">Creator</div>
                      <div class="text-center">Pro</div>
                    </div>
                    <For each={creatorFeatures}>
                      {(feature) => (
                        <div class="grid grid-cols-5 gap-4 p-4 border-t border-gray-100 text-sm">
                          <div class="font-medium">{feature.name}</div>
                          <div class="text-center">
                            {typeof feature.free === "boolean" ? (
                              feature.free ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.free
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.plus === "boolean" ? (
                              feature.plus ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.plus
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.creator === "boolean" ? (
                              feature.creator ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.creator
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.pro === "boolean" ? (
                              feature.pro ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.pro
                            )}
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>

                {/* Pro Features */}
                <div class="mb-8">
                  <h3 class="text-lg font-semibold mb-4 bg-gray-50 p-4 rounded-t-lg">🥇 Pro Control & Privacy</h3>
                  <div class="border border-gray-200 rounded-b-lg overflow-hidden">
                    <div class="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-sm">
                      <div></div>
                      <div class="text-center">Free</div>
                      <div class="text-center">Plus</div>
                      <div class="text-center">Creator</div>
                      <div class="text-center">Pro</div>
                    </div>
                    <For each={proFeatures}>
                      {(feature) => (
                        <div class="grid grid-cols-5 gap-4 p-4 border-t border-gray-100 text-sm">
                          <div class="font-medium">{feature.name}</div>
                          <div class="text-center">
                            {typeof feature.free === "boolean" ? (
                              feature.free ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.free || (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.plus === "boolean" ? (
                              feature.plus ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.plus || (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.creator === "boolean" ? (
                              feature.creator ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.creator || (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            )}
                          </div>
                          <div class="text-center">
                            {typeof feature.pro === "boolean" ? (
                              feature.pro ? (
                                <div class="text-green-500 flex justify-center">
                                  <CheckIcon />
                                </div>
                              ) : (
                                <div class="text-gray-400 flex justify-center">
                                  <XIcon />
                                </div>
                              )
                            ) : (
                              feature.pro
                            )}
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
  )
}
