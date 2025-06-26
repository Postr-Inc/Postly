import { createSignal, onCleanup, onMount, For, Show, createEffect } from "solid-js";
import Page from "@/src/Utils/Shared/Page";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useFeed from "@/src/Utils/Hooks/useFeed";
import { api } from "@/src";
import { joinClass } from "@/src/Utils/Joinclass";

export default function SnippetReels() {
  const { params, route, navigate } = useNavigation("/snippets");
  const { posts, loading } = useFeed("posts", {
    filter: "isSnippet=true",
    sort: "-created",
    _for: "snippets",
    limit: 10,
  });

  const [activeIndex, setActiveIndex] = createSignal(0);
  const [userInteracted, setUserInteracted] = createSignal(false);
  const [videoLoaded, setVideoLoaded] = createSignal<boolean[]>([]);

  let videoRefs: HTMLVideoElement[] = [];
  let containerRef: HTMLDivElement | undefined;
  let observer: IntersectionObserver | null = null;

  createEffect(() => {
    const currentPosts = posts();
    if (currentPosts && currentPosts.length > 0) {
      videoRefs = new Array(currentPosts.length).fill(null);
      setVideoLoaded(new Array(currentPosts.length).fill(false));
    }
  });

  const handleUserInteraction = () => {
    setUserInteracted(true);
    const currentVideo = videoRefs[activeIndex()];
    if (currentVideo) currentVideo.muted = false;
  };

  const handleVideoLoaded = (index: number) => {
    setVideoLoaded(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  const setupObserver = () => {
    if (!containerRef || observer) return;

    console.log('Setting up observer...');
    let debounceTimer: number | null = null;

    observer = new IntersectionObserver(
      (entries) => {
        console.log('Observer triggered with entries:', entries.length);
        
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          let bestMatch = { index: -1, ratio: 0 };
          entries.forEach(entry => {
            const index = Number(entry.target.getAttribute("data-index"));
            console.log(`Entry ${index}: intersecting=${entry.isIntersecting}, ratio=${entry.intersectionRatio}`);
            
            if (entry.isIntersecting && !isNaN(index)) {
              const ratio = entry.intersectionRatio;
              if (ratio > bestMatch.ratio) bestMatch = { index, ratio };
            }
          });
          
          if (bestMatch.index !== -1 && bestMatch.ratio > 0.5 && bestMatch.index !== activeIndex()) {
            console.log('Setting active index to:', bestMatch.index);
            setActiveIndex(bestMatch.index);
          }
        }, 100);
      },
      {
        root: containerRef,
        threshold: [0.1, 0.25, 0.5, 0.75, 1.0], // More threshold values for better detection
        rootMargin: "0px"
      }
    );
  };

  const observeElements = () => {
    if (!observer || !containerRef) return;

    const containers = containerRef.querySelectorAll("[data-index]");
    console.log('Found elements to observe:', containers.length);
    
    containers.forEach((element, idx) => {
      const dataIndex = element.getAttribute("data-index");
      console.log(`Observing element ${idx} with data-index: ${dataIndex}`);
      observer?.observe(element);
    });
  };

  onMount(() => {
    console.log('Component mounted, containerRef:', !!containerRef);
    setupObserver();
  });

  // Set up observer when posts are loaded and elements are rendered
  createEffect(() => {
    const currentPosts = posts();
    const isLoading = loading();
    
    if (!isLoading && currentPosts && currentPosts.length > 0 && containerRef) {
      console.log('Posts loaded, setting up observation...');
      
      // Wait for DOM to be fully rendered
      setTimeout(() => {
        observeElements();
      }, 200); // Increased timeout to ensure DOM is ready
    }
  });

  createEffect(() => {
    const currentIndex = activeIndex();
    const loaded = videoLoaded();

    console.log('Active index changed to:', currentIndex);

    if (!loaded[currentIndex]) return;

    videoRefs.forEach((video, i) => {
      if (!video || !loaded[i]) return;
      if (i === currentIndex) {
        video.muted = !userInteracted();
        video.play().catch(err => {
          video.muted = true;
          video.play().catch(() => {});
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  });

  onCleanup(() => {
    console.log('Cleaning up observer');
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  return (
    <Page {...{ params, route, navigate, id: "reels" }}>
      <div
        ref={containerRef}
        class="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth no-scrollbar"
        id="reel-container"
        onClick={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        <Show when={!loading() && posts()?.length > 0}>
          <For each={posts()}>
            {(post, index) => {
              const author = post.expand?.author;
              const videoUrl = post.files?.[0] ? api.cdn.getUrl("posts", post.id, post.files[0]) : null;

              return (
                <Show when={videoUrl}>
                  <div
                    data-index={index()}
                    class={joinClass(
                      "relative snap-start h-screen w-full bg-black flex items-center justify-center",
                      index() === posts().length - 1 ? "mb-24" : ""
                    )}
                  >
                    <video
  ref={(el) => (videoRefs[idx] = el!)}
  src={videoUrl}
  muted
  autoplay
  playsInline
  loop
  preload={index() < 3 ? "auto" : "metadata"}
  controls={false}
  onCanPlay={() => handleVideoLoaded(idx)}
  onLoadedData={() => handleVideoLoaded(idx)}
  onError={(e) => {
    console.error("Video error", e);
    alert("Video failed to load.");
  }}
/>

                    {/* Overlay */}
                    <div class="absolute bottom-0 sm:bottom-[120px] left-0 w-full text-white p-4 pointer-events-none z-10">
                      <div class="flex items-center gap-3 mb-2">
                        <Show when={author?.avatar} fallback={<div class="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-xs">?</div>}>
                          <img
                            src={api.cdn.getUrl("users", author.id, author.avatar)}
                            alt="avatar"
                            class="h-10 w-10 rounded-full object-cover"
                          />
                        </Show>
                        <div>
                          <div class="font-semibold">{author?.username || "Unknown"}</div>
                          <div class="text-sm text-gray-300">{author?.followers?.length || 0} followers</div>
                        </div>
                      </div>
                      <Show when={post.content}>
                        <p class="text-sm leading-tight font-semibold break-words max-w-full">{post.content}</p>
                      </Show>
                    </div>

                    <Show when={!videoLoaded()[index()]}>
                      <div class="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div class="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    </Show>

                    <Show when={activeIndex() === index() && !userInteracted()}>
                      <div class="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                        🔇 Tap to unmute
                      </div>
                    </Show>
                  </div>
                </Show>
              );
            }}
          </For>
        </Show>

        <Show when={loading()}>
          <div class="h-screen flex items-center justify-center bg-black text-white text-lg">Loading videos...</div>
        </Show>

        <Show when={!loading() && (!posts() || posts().length === 0)}>
          <div class="h-screen flex items-center justify-center bg-black text-white text-lg">No videos available</div>
        </Show>
      </div>
    </Page>
  );
}
