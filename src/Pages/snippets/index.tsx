"use client"

import { createSignal, onCleanup, onMount, For, Show, createEffect } from "solid-js"
import Page from "@/src/Utils/Shared/Page"
import useNavigation from "@/src/Utils/Hooks/useNavigation"
import useFeed from "@/src/Utils/Hooks/useFeed"
import { api } from "@/src"
import { joinClass } from "@/src/Utils/Joinclass"
import StringJoin from "@/src/Utils/StringJoin"

function VideoWithCleanup(props: { src: string; index: number; onCanPlay: () => void }) {
  let videoRef: HTMLVideoElement | undefined
  // REMOVE onCleanup: it's not needed here
  // Browsers already pause & unload video when removed
  return (
    <video
      ref={(el) => {
        videoRef = el!
        videoRefs[props.index] = el!
      }}
      class="h-full w-full object-cover z-0 transition-all duration-500 ease-out"
      muted
      loop
      playsinline
      src={props.src}
      preload={props.index < 3 ? "auto" : "metadata"}
      controls={false}
      onCanPlay={props.onCanPlay}
      onLoadedData={props.onCanPlay}
    />
  )
}

// Solid SVG Icons Component
const Icons = {
  Heart: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  ),
  HeartOutline: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>
  ),
  Chat: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
      />
    </svg>
  ),
  Share: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Bookmark: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  BookmarkOutline: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
      />
    </svg>
  ),
  Play: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Pause: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  VolumeOff: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L19.5 10.94l-1.72-1.72Z" />
    </svg>
  ),
  VolumeUp: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0 11.249 11.249 0 0 1 0 15.788.75.75 0 0 1-1.06-1.06 9.749 9.749 0 0 0 0-13.668.75.75 0 0 1 0-1.06Z" />
      <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6.251 6.251 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.751 4.751 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
    </svg>
  ),
  User: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  DotsVertical: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
        clipRule="evenodd"
      />
    </svg>
  ),
}

let videoRefs: HTMLVideoElement[] = []

export default function SnippetReels() {
  const { params, route, navigate } = useNavigation("/snippets")

  function pauseAllVideos() {
    videoRefs.forEach((video) => {
      if (!video) return
      video.pause()
      video.currentTime = 0
      video.muted = true
    })
  }

  const [activeIndex, setActiveIndex] = createSignal(0)
  const { posts, loading } = useFeed(
    "posts",
    {
      filter: "isSnippet=true",
      sort: "-created",
      _for: "snippets",
      limit: 10,
    },
    activeIndex,
  )

  const [userInteracted, setUserInteracted] = createSignal(false)
  const [videoLoaded, setVideoLoaded] = createSignal<boolean[]>([])
  const [currentPost, setCurrentPost] = createSignal(null)
  const [isPlaying, setIsPlaying] = createSignal(true)

  let containerRef: HTMLDivElement | undefined
  let observer: IntersectionObserver | null = null

  createEffect(() => {
    const currentPosts = posts()
    if (currentPosts && currentPosts.length > 0 && videoRefs.length !== currentPosts.length) {
      // initialize with nulls only if lengths differ
      videoRefs = new Array(currentPosts.length).fill(null)
      setVideoLoaded(new Array(currentPosts.length).fill(false))
    }
  })

  const handleUserInteraction = () => {
    if (!userInteracted()) {
      setUserInteracted(true)
      const currentVideo = videoRefs[activeIndex()]
      if (currentVideo) {
        currentVideo.muted = false
        currentVideo.play().catch(() => {})
      }
    }
  }

  const togglePlayPause = (e: Event) => {
    e.stopPropagation()
    const currentVideo = videoRefs[activeIndex()]
    if (!currentVideo) return

    if (currentVideo.paused) {
      currentVideo.play().catch(() => {})
      setIsPlaying(true)
    } else {
      currentVideo.pause()
      setIsPlaying(false)
    }
  }

  const handleVideoLoaded = (index: number) => {
    setVideoLoaded((prev) => {
      const newLoaded = [...prev]
      newLoaded[index] = true
      return newLoaded
    })
  }

  const setupObserver = () => {
    if (!containerRef || observer) return
    console.log("Setting up observer...")

    const debounceTimer: number | null = null

    observer = new IntersectionObserver(
      (entries) => {
        console.log("Observer triggered with entries:", entries.length)
        if (debounceTimer) clearTimeout(debounceTimer)

        let bestMatch = { index: -1, ratio: 0 }

        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          console.log(`Entry ${index}: intersecting=${entry.isIntersecting}, ratio=${entry.intersectionRatio}`)
          if (entry.isIntersecting && !isNaN(index)) {
            const ratio = entry.intersectionRatio
            if (ratio > bestMatch.ratio) bestMatch = { index, ratio }
          }
        })

        if (bestMatch.index !== -1 && bestMatch.ratio > 0.5 && bestMatch.index !== activeIndex()) {
          console.log("Setting active index to:", bestMatch.index)
          setActiveIndex(bestMatch.index)
          setIsPlaying(true)
          setCurrentPost(posts()[activeIndex()])
        }
      },
      {
        root: containerRef,
        threshold: [0.1, 0.25, 0.5, 0.75, 1.0],
        rootMargin: "0px",
      },
    )
  }

  const observeElements = () => {
    if (!observer || !containerRef) return
    const containers = containerRef.querySelectorAll("[data-index]")
    console.log("Found elements to observe:", containers.length)
    containers.forEach((element, idx) => {
      const dataIndex = element.getAttribute("data-index")
      console.log(`Observing element ${idx} with data-index: ${dataIndex}`)
      observer?.observe(element)
    })
  }

  onMount(() => {
    console.log("Component mounted, containerRef:", !!containerRef)
    setupObserver()
  })

  createEffect(() => {
    const currentPosts = posts()
    const isLoading = loading()
    if (!isLoading && currentPosts && currentPosts.length > 0 && containerRef) {
      console.log("Posts loaded, setting up observation...")
      setTimeout(() => {
        observeElements()
      }, 200)
    }
  })

  createEffect(() => {
    const currentIndex = activeIndex()
    const loaded = videoLoaded()
    if (!loaded[currentIndex]) return

    setCurrentPost(posts()[currentIndex])

    videoRefs.forEach((video, i) => {
      if (!video || !loaded[i]) return

      if (i === currentIndex) {
        // Sync playing state exactly
        if (isPlaying()) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
        // Mute logic stays here, but only mute if not userInteracted
        video.muted = !userInteracted()
      } else {
        // Other videos always paused and muted
        video.pause()
        video.currentTime = 0
        video.muted = true
      }
    })
  })

  onCleanup(() => {
    console.log("Cleaning up observer")
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  async function handleLike(post: any) {
    const userId = api.authStore.model?.id
    if (!userId) return

    const hasLiked = post.likes.includes(userId)
    const updatedLikes = hasLiked ? post.likes.filter((id: string) => id !== userId) : [...post.likes, userId]

    // Optimistically update post object
    post.likes = updatedLikes

    // Update the local signal state if this is the current post
    if (post.id === currentPost()?.id) {
      setCurrentPost({ ...post })
    }

    // Update the global cache
    api.updateCache("posts", post.id, { likes: updatedLikes })

    try {
      await api.send(`/actions/posts/${hasLiked ? "unlike" : "like"}`, {
        body: { targetId: post.id },
      })
    } catch (err) {
      console.error("Like/unlike request failed:", err)
      // Optionally rollback like state on failure
      const rollbackLikes = hasLiked ? [...post.likes, userId] : post.likes.filter((id: string) => id !== userId)
      post.likes = rollbackLikes
      if (post.id === currentPost()?.id) {
        setCurrentPost({ ...post })
      }
      api.updateCache("posts", post.id, { likes: rollbackLikes })
    }
  }

  const handleShare = (post: any) => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this snippet",
        url: window.location.href,
      })
    }
  }

  return (
    <Page {...{ params, route, navigate, id: "reels" }}>
      <div
        ref={containerRef}
        class="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth no-scrollbar relative"
        id="reel-container"
        onClick={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        {/* Gradient overlay for better visual depth */}
        <div class="fixed inset-0   pointer-events-none z-[1]" />

        <Show when={!loading() && posts()?.length > 0}>
          <For each={posts()}>
            {(post, index) => {
              console.log(index())
              const author = post.expand?.author
              const videoUrl = post.files?.[0] ? api.cdn.getUrl("posts", post.id, post.files[0]) : null
              const isLiked = post.likes?.includes(api.authStore.model?.id)
              const isCurrentVideo = index() === activeIndex()

              return (
                <Show when={videoUrl}>
                  <div
                    data-index={index()}
                    class={joinClass(
                      "relative snap-start h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center transition-all duration-700 ease-out",
                      index() === posts().length - 1 ? "mb-24" : "",
                      isCurrentVideo ? "scale-100 brightness-100" : "scale-95 brightness-75",
                    )}
                  >
                    {/* Enhanced video container with subtle glow */}
                    <div class="absolute inset-0 overflow-hidden">
                      <VideoWithCleanup src={videoUrl} index={index()} onCanPlay={() => handleVideoLoaded(index())} />
                      {/* Subtle inner shadow for depth */}
                      <div class="absolute inset-0 shadow-inner shadow-black/30 pointer-events-none" />
                    </div>

                    {/* Enhanced gradient overlays */}
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none z-[2]" />
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none z-[2]" />

                    {/* Enhanced Header - Smaller Snippets watermark */}
                    <div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 ">
                      <div class="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
                        <h1 class="font-bold text-xl text-white drop-shadow-lg">✨ Snippets</h1>
                      </div>
                      <div class="flex gap-3">
                        <Show when={isCurrentVideo && !userInteracted()}>
                          <div
                            class="bg-black/40 backdrop-blur-md px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 hover:bg-black/60 transition-all duration-300 cursor-pointer shadow-lg animate-pulse"
                            onClick={() => setUserInteracted(true)}
                          >
                            <Icons.VolumeOff class="w-4 h-4" />
                            Tap to unmute
                          </div>
                        </Show>
                        <div class="bg-black/40 backdrop-blur-md p-2 rounded-full hover:bg-black/60 transition-all duration-300 cursor-pointer shadow-lg hover:scale-110">
                          <Icons.DotsVertical class="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Play/Pause overlay */}
                    <Show when={isCurrentVideo && !isPlaying()}>
                      <div
                        class="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                        onClick={togglePlayPause}
                      >
                        <div class="bg-black/50 backdrop-blur-md p-6 rounded-full hover:bg-black/70 transition-all duration-300 hover:scale-110 shadow-2xl">
                          <Icons.Play class="w-16 h-16 text-white ml-1 drop-shadow-lg" />
                        </div>
                      </div>
                    </Show>

                    {/* Enhanced Bottom content with gradients */}
                    <div class="absolute bottom-0 sm:bottom-[120px] left-0 right-0 text-white  pointer-events-none z-10">
                      <div class="flex justify-between items-end">
                        {/* Enhanced Left side with gradient background */}
                        <div class="flex-1 mr-4">
                          <div
                            class="flex items-center gap-3 mb-4 cursor-pointer pointer-events-auto group p-3 rounded-xl"
                            onClick={() => navigate(`/u/${author.username}`)}
                          >
                            <div class="relative">
                              <Show
                                when={author?.avatar}
                                fallback={
                                  <div class="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                                    <Icons.User class="w-6 h-6 text-white" />
                                  </div>
                                }
                              >
                                <img
                                  src={api.cdn.getUrl("users", author.id, author.avatar) || "/placeholder.svg"}
                                  alt="avatar"
                                  class="h-12 w-12 rounded-full object-cover shadow-lg group-hover:scale-110 transition-all duration-300"
                                />
                              </Show>
                               
                            </div>
                            <div>
                              <div class="font-bold text-lg text-white drop-shadow-lg group-hover:text-purple-300 transition-colors duration-300">
                                {author?.username || "Unknown"}
                              </div>
                              <div class="text-sm text-gray-300 flex items-center gap-1 drop-shadow">
                                <Icons.User class="w-3 h-3" />
                                {(author?.followers?.length || 0).toLocaleString()} followers
                              </div>
                            </div>
                          </div>

                          <Show when={post.content}>
                            <div class="bg-gradient-to-r from-black/50 via-black/30 to-transparent backdrop-blur-md p-5 rounded-xl shadow-lg mb-2">
                              <p class="text-sm leading-relaxed font-medium break-words max-w-full text-white drop-shadow">
                                {post.content}
                              </p>
                            </div>
                          </Show>
                        </div>

                        {/* Enhanced Right side - Action buttons without borders */}
                        <div class="flex flex-col items-center gap-4 pointer-events-auto p-5">
                          {/* Enhanced Like button */}
                          <div class="flex flex-col items-center gap-1">
                            <div
                              class="bg-black/40 backdrop-blur-md p-3 rounded-full cursor-pointer hover:bg-black/60 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95"
                              onClick={() => handleLike(post)}
                            >
                              <Show
                                when={isLiked}
                                fallback={<Icons.HeartOutline class="w-7 h-7 text-white drop-shadow-lg" />}
                              >
                                <Icons.Heart
                                  class={joinClass(
                                    "w-7 h-7 drop-shadow-lg transition-all duration-300",
                                    currentPost() && currentPost().likes?.length
                                      ? "text-red-500 animate-pulse"
                                      : "text-white",
                                  )}
                                />
                              </Show>
                            </div>
                            <span class="text-xs font-bold text-white drop-shadow bg-gradient-to-r from-black/40 to-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                              {((currentPost() && currentPost().likes?.length) || 0) > 999
                                ? `${(((currentPost() && currentPost().likes?.length) || 0) / 1000).toFixed(1)}k`
                                : (currentPost() && currentPost().likes?.length) || 0}
                            </span>
                          </div>

                          {/* Enhanced Comment button */}
                          <div class="flex flex-col items-center gap-1">
                            <div
                              class="bg-black/40 backdrop-blur-md p-3 rounded-full cursor-pointer hover:bg-black/60 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95"
                              onClick={() => navigate(StringJoin("/view/", "posts/", post.id))}
                            >
                              <Icons.Chat class="w-7 h-7 text-white drop-shadow-lg" />
                            </div>
                            <span class="text-xs font-bold text-white drop-shadow bg-gradient-to-r from-black/40 to-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                              {post.comments?.length || 0}
                            </span>
                          </div>

                          {/* Enhanced Share button */}
                          <div class="flex flex-col items-center gap-1">
                            <div
                              class="bg-black/40 backdrop-blur-md p-3 rounded-full cursor-pointer hover:bg-black/60 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95"
                              onClick={() => handleShare(post)}
                            >
                              <Icons.Share class="w-7 h-7 text-white drop-shadow-lg" />
                            </div>
                          </div>

                          {/* Enhanced Bookmark button */}
                          <div class="flex flex-col items-center gap-1">
                            <div class="bg-black/40 backdrop-blur-md p-3 rounded-full cursor-pointer hover:bg-black/60 transition-all duration-300 shadow-lg hover:scale-110 active:scale-95">
                              <Icons.BookmarkOutline class="w-7 h-7 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Loading indicator */}
                    <Show when={!videoLoaded()[index()]}>
                      <div class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                        <div class="relative">
                          <div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-lg"></div>
                          <div
                            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin"
                            style="animation-direction: reverse;"
                          ></div>
                        </div>
                      </div>
                    </Show>

                    {/* Click overlay for play/pause */}
                    <Show when={isCurrentVideo && isPlaying()}>
                      <div class="absolute inset-0 z-[5] cursor-pointer" onClick={togglePlayPause} />
                    </Show>
                  </div>
                </Show>
              )
            }}
          </For>
        </Show>

        {/* Enhanced Loading state */}
        <Show when={loading()}>
          <div class="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white text-lg">
            <div class="flex flex-col items-center gap-6">
              <div class="relative">
                <div class="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-2xl"></div>
                <div
                  class="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin"
                  style="animation-direction: reverse;"
                ></div>
              </div>
              <div class="text-xl font-semibold animate-pulse drop-shadow-lg">Loading snippets...</div>
            </div>
          </div>
        </Show>

        {/* Enhanced Empty state */}
        <Show when={!loading() && (!posts() || posts().length === 0)}>
          <div class="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white text-lg">
            <div class="flex flex-col items-center gap-6 text-center">
              <div class="p-6 bg-gray-800/50 rounded-full backdrop-blur-sm">
                <Icons.Chat class="w-20 h-20 text-gray-500" />
              </div>
              <div class="text-xl font-semibold drop-shadow-lg">No snippets available</div>
              <div class="text-gray-400 drop-shadow">Check back later for new content!</div>
            </div>
          </div>
        </Show>
      </div>

      {/* Custom styles for enhanced animations */}
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </Page>
  )
}
