"use client"

import { createSignal, createEffect, onMount } from "solid-js"

export default function FileBrowser() {
  const [url, setUrl] = createSignal("")
  const [loading, setLoading] = createSignal(false)
  const [loaded, setLoaded] = createSignal(false)
  const [error, setError] = createSignal(false)
  const [isFullscreen, setIsFullscreen] = createSignal(false)
  const [showFullUrl, setShowFullUrl] = createSignal(false)
  const [history, setHistory] = createSignal<string[]>([])
  const [historyIndex, setHistoryIndex] = createSignal(-1)
  const [inputUrl, setInputUrl] = createSignal("")
  const [copied, setCopied] = createSignal(false)

  let iframeRef: HTMLIFrameElement
  let modalRef: HTMLDialogElement

  // Auto fullscreen on small screens (mobile)
  onMount(() => {
    if (window.innerWidth <= 640) { // sm breakpoint or less
      setIsFullscreen(true)
    }
  })

  createEffect(() => {
    const originalWindowOpen = window.open

    // Override window.open to handle forbidden domains or open in viewer
    // @ts-ignore
    window.open = (targetUrl: string) => {
      const forbidden = [
        "github.com",
        "linkedin.com",
        "twitter.com",
        "facebook.com",
        "instagram.com",
        "reddit.com",
        "tiktok.com",
        "youtube.com",
        "discord.com",
        "whatsapp.com",
        "telegram.org",
        "snapchat.com",
      ]

      const needsExternal = forbidden.some((domain) => targetUrl.includes(domain))

      if (needsExternal) {
        originalWindowOpen(targetUrl, "_blank")
      } else {
        setUrl(targetUrl)
        setInputUrl(targetUrl)
        setLoading(true)
        setError(false)
        setLoaded(false)

        const newHistory = history().slice(0, historyIndex() + 1)
        newHistory.push(targetUrl)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)

        modalRef?.showModal()
      }
    }
  })

  const openInViewer = (newUrl: string) => {
    setUrl(newUrl)
    setInputUrl(newUrl)
    setLoading(true)
    setError(false)
    setLoaded(false)

    const newHistory = history().slice(0, historyIndex() + 1)
    newHistory.push(newUrl)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    modalRef?.showModal()
  }

  const navigateBack = () => {
    if (historyIndex() > 0) {
      const newIndex = historyIndex() - 1
      setHistoryIndex(newIndex)
      const prevUrl = history()[newIndex]
      setUrl(prevUrl)
      setInputUrl(prevUrl)
      setLoading(true)
      setError(false)
      setLoaded(false)
    }
  }

  const navigateForward = () => {
    if (historyIndex() < history().length - 1) {
      const newIndex = historyIndex() + 1
      setHistoryIndex(newIndex)
      const nextUrl = history()[newIndex]
      setUrl(nextUrl)
      setInputUrl(nextUrl)
      setLoading(true)
      setError(false)
      setLoaded(false)
    }
  }

  const refresh = () => {
    if (url() && iframeRef) {
      setLoading(true)
      setError(false)
      setLoaded(false)
      iframeRef.src = url()
    }
  }

  const goHome = () => {
    const homeUrl = "https://example.com"
    openInViewer(homeUrl)
  }

  const handleUrlSubmit = (e: Event) => {
    e.preventDefault()
    if (inputUrl().trim()) {
      let processedUrl = inputUrl().trim()
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl
      }
      openInViewer(processedUrl)
    }
  }

  const closeViewer = () => {
    setUrl("")
    setInputUrl("")
    setLoading(false)
    setLoaded(false)
    setError(false)
    setIsFullscreen(false)
    modalRef?.close()
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen())
  }

  const copyUrl = async () => {
    if (url()) {
      try {
        await navigator.clipboard.writeText(url())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // ignore
      }
    }
  }

  const openExternal = () => {
    if (url()) {
      window.open(url(), "_blank")
    }
  }

  return (
    <dialog id="browser-modal" ref={modalRef!} class="modal">
      <div
        class={`bg-white scroll  shadow-2xl overflow-hidden transition-all duration-300
          ${
            isFullscreen()
              ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none"
              : "w-[95vw] h-[90vh] max-w-[95vw] max-h-[90vh] sm:w-[90vw] sm:h-[85vh] lg:w-[85vw] lg:h-[80vh] xl:w-[80vw] xl:h-[85vh] 2xl:w-[75vw] 2xl:h-[80vh]"
          }
          rounded-xl overflow-hidden sm:rounded-none
        `}
      >
        {/* Header */}
        <div class="bg-gray-50 border-b border-gray-200 p-3 sm:p-4">
          {/* Navigation Controls */}
          <div class="flex items-center gap-2 mb-3">
            <div class="flex items-center gap-1">
              <button
                onClick={navigateBack}
                disabled={historyIndex() <= 0}
                class="btn btn-sm btn-ghost btn-circle disabled:opacity-30"
                title="Back"
              >
                {/* SVG Back icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>

              <button
                onClick={navigateForward}
                disabled={historyIndex() >= history().length - 1}
                class="btn btn-sm btn-ghost btn-circle disabled:opacity-30"
                title="Forward"
              >
                {/* SVG Forward icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <button
                onClick={refresh}
                disabled={!url()}
                class="btn btn-sm btn-ghost btn-circle disabled:opacity-30"
                title="Refresh"
              >
                {/* SVG Refresh icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>

               
            </div>

            <div class="divider divider-horizontal mx-1 hidden sm:flex"></div>

            {/* URL Bar */}
            <form onSubmit={handleUrlSubmit} class="flex-1 flex items-center gap-2">
              <div class="flex-1 relative">
                <input
                  type="text"
                  value={inputUrl()}
                  onInput={(e) => setInputUrl(e.currentTarget.value)}
                  placeholder="Enter URL..."
                  class="input input-sm input-bordered w-full pr-20 text-sm focus:input-primary"
                />
                <div class="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {url() && (
                    <>
                      <button type="button" onClick={copyUrl} class="btn btn-xs btn-ghost btn-circle" title="Copy URL">
                        {copied() ? (
                          <span class="text-success text-xs">Copied</span>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            class="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={openExternal}
                        class="btn btn-xs btn-ghost btn-circle"
                        title="Open in new tab"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          class="w-3 h-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>

            <div class="divider divider-horizontal mx-1 hidden sm:flex"></div>

            {/* Fullscreen & Close Controls */}
            <div class="flex items-center gap-1">
              <button
                onClick={toggleFullscreen}
                class="btn btn-sm btn-ghost btn-circle"
                title={isFullscreen() ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen() ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 15v4.5M15 15h4.5M15 15l5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                )}
              </button>

              <button onClick={closeViewer} class="btn btn-sm btn-ghost btn-circle hover:btn-error" title="Close">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* URL Display with toggle */}
          {url() && (
            <div class="mb-2">
              <div
                class="text-xs text-gray-600 truncate cursor-pointer hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                onClick={() => setShowFullUrl(!showFullUrl())}
                title="Click to toggle full URL display"
              >
                {showFullUrl() ? url() : url().length > 80 ? url().substring(0, 80) + "..." : url()}
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center gap-2">
              {loading() && (
                <div class="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    class="w-3 h-3 animate-spin"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  <span>Loading...</span>
                </div>
              )}
              {error() && (
                <div class="flex items-center gap-1 text-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    class="w-3 h-3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Error loading page</span>
                </div>
              )}
              {loaded() && !error() && !loading() && <span>Loaded</span>}
            </div>
            <div class="text-right">{historyIndex() + 1}/{history().length}</div>
          </div>
        </div>

        {/* Content - iframe or error */}
        <div class="flex-1 w-full h-full overflow-y-hidden scroll  bg-gray-100 dark:bg-gray-900">
          {url() ? (
            <iframe
              ref={iframeRef!}
              src={url()}
              class="w-full scroll  h-full border-0"
              onLoad={() => {
                setLoading(false)
                setLoaded(true)
                setError(false)
              }}
              onError={() => {
                setLoading(false)
                setLoaded(false)
                setError(true)
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              allow="fullscreen"
            />
          ) : (
            <div class="flex justify-center items-center h-full text-gray-400">No URL loaded</div>
          )}
        </div>
      </div>
    </dialog>
  )
}
