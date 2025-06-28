import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { api } from "@/src";
import { HttpCodes } from "../SDK/opCodes";
let isFetchingMore = false;
async function list(
  collection: string,
  page: number,
  feed: () => string,
  options: { filter?: string; sort?: string; limit?: number; _for?: any } = {}
) {

  console.log({
    recommended: feed() === "recommended",
    order: options.sort || "-created",
    filter: options.filter && options.filter.length > 0 ? options.filter : "author.deactivated=false",
  })
  return api
    .collection(collection)
    .list(page, options.limit || 10, {
      recommended: feed() === "recommended",
      order: options.sort || "-created",
      filter: options.filter && options.filter.length > 0 ? options.filter : "author.deactivated=false",
      cacheKey: `${collection}_${feed()}_${page}_feed_${api.authStore.model.id || api.authStore.model.token?.split(".")[0]}_${options._for || ''}`,
      expand: [
        "comments.likes",
        "comments",
        "comments.author",
        "author",
        "author.following",
        "author.followers",
        "author.followers.following",
        "author.TypeOfContentPosted",
        "likes",
        "repost.likes",
        "repost.author",
        "repost",
      ],
    })
    .then((res: any) => {
      if (res.opCode !== HttpCodes.OK) throw res;
      return res;
    });
}





export default function useFeed(
  collection: string,
  options: { _for?: string; filter?: string; sort?: string; limit?: number } = {},
  activeIndexSignal?: () => number,
  pauseAllVideos?: () => void
) {
  const initialFeed = options._for === "home"
    ? "recommended"
    : options._for === "snippets"
      ? "snippets"
      : options._for || "all";
  const [feed, setFeed] = createSignal(initialFeed);
  const [currentPage, setCurrentPage] = createSignal(1);
  const [posts, setPosts] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);
  const [hasMore, setHasMore] = createSignal(true);
  const [refresh, setRefresh] = createSignal(false);
  const [totalPages, setTotalPages] = createSignal(0);
  const [LoadingMore, setLoadingMore] = createSignal(false)

  function reset() {
    setPosts([]);
    setCurrentPage(1);
    setHasMore(true);
  }

  async function fetchPosts(fetchOptions: any = {}, resetFlag = false) {
    try {
      if (resetFlag) {
        // Initial load or pull-to-refresh
        setLoading(true);
        setCurrentPage(1);
        reset();
      } else {
        // Scroll load-more
        setLoadingMore(true);
      }

      const page = resetFlag ? 1 : currentPage();
      const data = await list(collection, page, feed, fetchOptions);

      // Deduplicate by ID
      const existingIds = new Set(posts().map(post => post.id));
      const newItems = data.items.filter((item: any) => !existingIds.has(item.id));

      if (resetFlag) {
        setPosts(data.items);
      } else {
        setPosts([...posts(), ...newItems]);
      }

      setTotalPages(data.totalPages || 0);

      if (data.totalPages <= page) {
        setHasMore(false);
      }



      // Relevant people logic
      const relevantPeople: any[] = [];
      for (const item of data.items) {
        const followers = item?.expand?.author?.expand?.followers ?? [];
        for (const follower of followers) {
          if (
            follower.id !== api.authStore.model.id &&
            !follower.followers.includes(api.authStore.model.id) &&
            !follower.deactivated &&
            !relevantPeople.find(p => p.id === follower.id)
          ) {
            relevantPeople.push(follower);
            if (relevantPeople.length >= 5) break;
          }
        }
      }

      // @ts-ignore
      window.setRelevantPeople?.(relevantPeople);

    } catch (err) {
      setError(err as any);
    } finally {
      if (resetFlag) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
      setRefresh(false);
    }
  }


  onMount(() => {

    // Infinite scroll for touch & scroll
    let scrollTimeout: any = null;
    async function checkLoadMore() {
      if (scrollTimeout || isFetchingMore || loading() || refresh()) return;

      scrollTimeout = setTimeout(async () => {
        scrollTimeout = null;

        const nearBottom =
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 3000;

        if (nearBottom && hasMore() && totalPages() > currentPage()) {
          isFetchingMore = true;

          const nextPage = currentPage() + 1;
          setCurrentPage(nextPage);
          await fetchPosts({ ...options }, false);

          isFetchingMore = false;
        }
      }, 200);
    }

    window.addEventListener("scroll", checkLoadMore);

    // Also check on touchmove for mobile
    window.addEventListener("touchmove", checkLoadMore);

    // Pull-to-refresh: detect downward swipe from top
    let startY = 0;

    const touchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && activeIndexSignal?.() === 0) {
        startY = e.touches[0].clientY;
        pauseAllVideos()
      }
    };

    const touchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - startY;

      if (deltaY > 50 && window.scrollY === 0 && activeIndexSignal?.() === 0) {
        // Pulled down from top
        reset();
        fetchPosts({ ...options }, true);
        pauseAllVideos()
      }
    };

    window.addEventListener("touchstart", touchStart);
    window.addEventListener("touchend", touchEnd);

    createEffect(() => {



      // Initial fetch
      fetchPosts({ ...options }, true);

      // Cleanup
      return () => {
        window.removeEventListener("popstate", popHandler);
        window.removeEventListener("scroll", checkLoadMore);
        window.removeEventListener("touchmove", checkLoadMore);
        window.removeEventListener("touchstart", touchStart);
        window.removeEventListener("touchend", touchEnd);
      };
    });

    // Safe redundant fetch 
  });


  return {
    feed,
    currentPage,
    posts,
    loading,
    error,
    hasMore,
    setFeed,
    reset,
    setPosts,
  };
}

