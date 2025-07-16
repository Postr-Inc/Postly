"use client"

import useNavigation from "@/src/Utils/Hooks/useNavigation"
import { createSignal, createMemo, For } from "solid-js"

const safetySections = [
  {
    id: "csae-enforcement",
    title: "CSAE Reporting & Enforcement",
    content:
      "Postly has zero tolerance for child sexual abuse material (CSAM). Click to learn more about how we handle reports and comply with legal obligations.",
    full: `
      <p class="mb-4">Postly is committed to protecting minors online.</p>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>We strictly prohibit child sexual abuse and exploitation (CSAE).</li>
        <li>We use automated and manual review processes to detect and remove CSAM.</li>
        <li>Users can report abuse in-app or directly via <a href="mailto:safety@postlyapp.com" class="text-blue-600 underline hover:text-blue-700">safety@postlyapp.com</a>.</li>
        <li>Verified reports are sent to the National Center for Missing & Exploited Children (NCMEC).</li>
        <li>We comply with laws including COPPA, GDPR, and DSA.</li>
        <li>Offending accounts are permanently banned and may be reported to authorities.</li>
      </ul>`,
    keywords: ["csae", "csam", "enforcement", "report", "abuse", "children", "compliance"],
    color: "bg-red-50",
    icon: "gavel",
  },
  {
    id: "age-restrictions",
    title: "Age Restrictions & Teen Safety",
    content: "Users must be 17 or older to access Postly. We restrict younger users for safety.",
    full: `
      <p class="mb-4">Postly is designed for users 17 years and older.</p>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>Users under 17 are not allowed to sign up.</li>
        <li>Features like direct messaging and sensitive content are age-restricted.</li>
        <li>We monitor for underage usage and remove accounts violating this rule.</li>
        <li>These controls align with Google Play, Apple, COPPA, and other global standards.</li>
      </ul>`,
    keywords: ["age", "restriction", "teen", "minimum", "policy"],
    color: "bg-purple-50",
    icon: "shield",
  },
  {
    id: "mental-health",
    title: "Mental Health & User Reporting",
    content: "Postly provides mental wellness resources and allows you to report abuse, harassment, and threats.",
    full: `
      <p class="mb-4">We take mental health and user safety seriously.</p>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>Users can report content, accounts, and messages for review.</li>
        <li>Reports are prioritized when related to CSAE or threats.</li>
        <li>We provide outreach to users expressing distress or suicidal intent.</li>
        <li>Resources from global mental health orgs are available in the app.</li>
        <li>Repeat abuse leads to permanent bans.</li>
      </ul>`,
    keywords: ["mental", "health", "report", "harassment", "threat", "abuse"],
    color: "bg-green-50",
    icon: "heart",
  },
  {
    id: "privacy-data",
    title: "Privacy, Consent & Data Handling",
    content: "We don't sell data. Postly follows strict privacy regulations like GDPR and COPPA.",
    full: `
      <p class="mb-4">Postly respects user privacy:</p>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>We do not sell or trade personal data.</li>
        <li>Users control visibility, data access, and content deletion.</li>
        <li>We comply with GDPR (Europe), CCPA (California), and COPPA (Children).</li>
        <li>Parents can request account reviews for minors.</li>
        <li>All data is encrypted at rest and in transit.</li>
      </ul>`,
    keywords: ["gdpr", "privacy", "data", "handling", "consent"],
    color: "bg-blue-50",
    icon: "eye",
  },
  {
    id: "community-rules",
    title: "Community Guidelines & Moderation",
    content: "We have zero tolerance for hate speech, abuse, or sexual content violations.",
    full: `
      <p class="mb-4">Postly protects all users through strict community rules:</p>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>Hate speech, racism, sexual abuse, and threats are prohibited.</li>
        <li>Spam, impersonation, and repeated harassment lead to bans.</li>
        <li>Content may be filtered for safety using automated moderation.</li>
        <li>Users may appeal takedowns or bans via <a href="mailto:safety@postlyapp.com" class="text-blue-600 underline hover:text-blue-700">safety@postlyapp.com</a>.</li>
      </ul>`,
    keywords: ["community", "rules", "moderation", "guidelines"],
    color: "bg-indigo-50",
    icon: "users",
  },
  {
    id: "law-enforcement",
    title: "Law Enforcement Requests",
    content: "We work with global authorities and comply with valid data requests.",
    full: `
      <p class="mb-4">Postly complies with legal investigations:</p>
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        <li>Lawful subpoenas or orders may require user content disclosure.</li>
        <li>We validate all requests and notify users unless legally prohibited.</li>
        <li>Emergency situations (e.g. imminent harm) may be acted on immediately.</li>
        <li>All disclosures follow jurisdictional privacy and legal standards.</li>
      </ul>`,
    keywords: ["law", "compliance", "subpoena", "legal", "authority"],
    color: "bg-gray-50",
    icon: "gavel",
  },
]

const icons = {
  gavel: () => (
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
      />
    </svg>
  ),
  shield: () => (
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  heart: () => (
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  eye: () => (
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  users: () => (
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      />
    </svg>
  ),
  search: () => (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  chevronDown: () => (
    <svg class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  home: () => (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
}

export default function SafetyCenter() {
  const [query, setQuery] = createSignal("")
  const [showSearch, setShowSearch] = createSignal(false)
  const [expandedIds, setExpandedIds] = createSignal(new Set())
  const { navigate } = useNavigation()
  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const current = new Set(prev)
      if (current.has(id)) {
        current.delete(id)
      } else {
        current.add(id)
      }
      return current
    })
  }

  const filteredSections = createMemo(() => {
    if (!query()) return safetySections
    const q = query().toLowerCase()
    return safetySections.filter(
      (section) =>
        section.title.toLowerCase().includes(q) ||
        section.content.toLowerCase().includes(q) ||
        section.keywords.some((k) => k.includes(q)),
    )
  })

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-8">
              <h1 class="text-xl font-semibold text-gray-900 hero flex gap-5"><img src="/icons/icon_transparent.png" class="black size-12"></img>Safety Center</h1>
            </div>

            <nav class="hidden md:flex items-center space-x-8">
              <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">
                Topics
              </a> 
              <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">
                Resources
              </a>
              <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">
                News
              </a>
            </nav>

            <div class="flex items-center space-x-4">
              <button
                onClick={() => setShowSearch(!showSearch())}
                class="p-2 text-gray-500 hover:text-gray-700 transition-colors md:hidden"
                aria-label="Toggle search"
              >
                {icons.search()}
              </button>
              <a  onClick={()=> navigate("/")} class=" cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"> 
                <span class=" sm:inline">Home</span>
              </a>
            </div>
          </div>

          {/* Mobile Search */}
          <div
            class={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
              showSearch() ? "max-h-20 mt-4" : "max-h-0"
            }`}
          >
            <input
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search safety topics..."
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              aria-label="Search safety topics"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div class="mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-8">Browse by topic </h2>

          {/* Desktop Search */}
          <div class="hidden md:block max-w-xl mb-12">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icons.search()}</div>
              <input
                type="text"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search safety topics..."
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
                aria-label="Search safety topics"
              />
            </div>
          </div>
        </div>

        {/* Topics Section */}
        <section class="mb-16">
           
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={filteredSections()}>
              {(section) => {
                const isExpanded = () => expandedIds().has(section.id)

                return (
                  <div
                    class={`${section.color} rounded-2xl p-6 hover:shadow-lg transition-all duration-200 border border-transparent hover:border-gray-200`}
                  >
                    {/* Header */}
                    <div class="flex items-start justify-between mb-4">
                      <div class="text-gray-600">{icons[section.icon]()}</div>
                    </div>

                    {/* Title */}
                    <h4 class="text-lg font-semibold text-gray-900 mb-3 leading-tight">{section.title}</h4>

                    {/* Content */}
                    <div class="mb-4">
                      {!isExpanded() && <p class="text-gray-700 text-sm leading-relaxed">{section.content}</p>}

                      {/* Expanded Content */}
                      <div
                        class={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded() ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div class="text-gray-700 text-sm leading-relaxed" innerHTML={section.full} />
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleExpanded(section.id)}
                      class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors group"
                      aria-label={isExpanded() ? `Collapse ${section.title}` : `Expand ${section.title}`}
                      type="button"
                    >
                      <span>{isExpanded() ? "Show Less" : "Learn More"}</span>
                      <div class={`transform transition-transform duration-200 ${isExpanded() ? "rotate-180" : ""}`}>
                        {icons.chevronDown()}
                      </div>
                    </button>
                  </div>
                )
              }}
            </For>
          </div>

          {/* No Results */}
          {filteredSections().length === 0 && query() && (
            <div class="text-center py-16">
              <div class="text-gray-400 mb-4">{icons.search()}</div>
              <p class="text-gray-500 text-lg mb-4">No topics found matching "{query()}"</p>
              <button
                onClick={() => setQuery("")}
                class="text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer class="bg-white border-t border-gray-200 mt-20">
        <div class="max-w-7xl mx-auto px-6 py-8">
          <div class="text-center text-sm text-gray-500">
            <p class="mb-2">Last updated: July 16, 2025</p>
            <p>
              Questions? Contact us at{" "}
              <a href="mailto:safety@postlyapp.com" class="text-blue-600 hover:text-blue-700 transition-colors">
                safety@postlyapp.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
