 import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { api } from "@/src";
import { HttpCodes } from "../SDK/opCodes";

async function list(
  collection: string,
  page: number,
  feed: () => string,
  options: { filter?: string; sort?: string; limit?: number; _for?: any } = {}
) {
  return api
    .collection(collection)
    .list(page, options.limit || 10, {
      recommended: feed() === "recommended",
      order: options.sort || "-created",
      filter: options.filter && options.filter.length > 0 ? options.filter : "author.deactivated=false",
      cacheKey: `${collection}_${feed()}_${page}_feed_${api.authStore.model.id || api.authStore.model.token?.split(".")[0]}_${options._for || "none"}`,
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
  onLoadNextPage?: (nextPage: number) => void
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
  const [totalPages, setTotalPages] = createSignal(0);
  const [totalItems, setTotalItems] = createSignal(0);
  const [refresh, setRefresh] = createSignal(false);

  let touchStartY = 0;
  let isSwipingUp = false;
  let swipeCount = 0;

  const SWIPE_UP_THRESHOLD = 50;
  const SWIPES_TO_LOAD_NEXT = 1;

  function reset() {
    setPosts([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalPages(0);
    setTotalItems(0);
  }

  async function fetchNextPage(page: number) {
    setLoading(true);
    try {
      const data = await list(collection, page, feed, options);
      const existingIds = new Set(posts().map(p => p.id));
      const newItems = data.items.filter((item: any) => !existingIds.has(item.id));

      setPosts([...posts(), ...newItems]);
      setCurrentPage(page);
      setTotalPages(data.totalPages || totalPages());
      setTotalItems(data.totalItems || totalItems());
      if (data.totalPages <= page) setHasMore(false);
    } catch (err) {
      setError(err as any);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPosts(fetchOptions: any = {}, resetFlag = false) {
    if (resetFlag) setLoading(true);

    try {
      if (resetFlag) reset();

      const page = resetFlag ? 1 : currentPage();

      const data = await list(collection, page, feed, fetchOptions);

      const existingIds = new Set(posts().map(p => p.id));
      const newItems = data.items.filter((item: any) => !existingIds.has(item.id));

      setPosts(resetFlag ? data.items : [...posts(), ...newItems]);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
      if (data.totalPages <= page) setHasMore(false);

      data.items.forEach((item: any) => {
        api.collection("posts").subscribe(item.id, { cb() {} });
      });

      // Relevant people discovery
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
      setLoading(false);
      setRefresh(false);
    }
  }

  // --- Swipe-to-load ---
  function onTouchStart(e: TouchEvent) {
    touchStartY = e.touches[0].clientY;
    isSwipingUp = false;
  }

  function onTouchMove(e: TouchEvent) {
    const deltaY = e.touches[0].clientY - touchStartY;
    if (
      deltaY < -SWIPE_UP_THRESHOLD &&
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
    ) {
      isSwipingUp = true;
    }
  }

  function onTouchEnd() {
    if (
      isSwipingUp &&
      hasMore() &&
      !loading() &&
      currentPage() < totalPages()
    ) {
      swipeCount++;
      if (swipeCount >= SWIPES_TO_LOAD_NEXT) {
        swipeCount = 0;
        const nextPage = currentPage() + 1;
        if (typeof onLoadNextPage === "function") {
          onLoadNextPage(nextPage);
        } else {
          fetchNextPage(nextPage);
        }
      }
    } else {
      swipeCount = 0;
    }
    isSwipingUp = false;
  }

  let scrollTimeout: any = null;
  function handleScroll() {
    if (scrollTimeout || loading() || refresh()) return;
    scrollTimeout = setTimeout(async () => {
      scrollTimeout = null;
      if (window.innerHeight + window.scrollY < document.body.offsetHeight - 350) return;
      if (hasMore() && totalPages() > currentPage()) {
        const nextPage = currentPage() + 1;
        await fetchNextPage(nextPage);
      }
    }, 300);
  }

  createEffect(() => {
    const selectedFeed = feed();

    // Use filter from options, else fallback to default
    let filter = options.filter || `author.id != "${api.authStore.model.id}"`;

    if (selectedFeed === "following") {
      filter = `author.followers ~ "${api.authStore.model.id}"`;
    }

    fetchPosts({ ...options, filter }, true);
  });

  onMount(() => {
    // Removed redundant fetchPosts call here to avoid double fetch

    window.addEventListener("popstate", () => {
      reset();
      fetchPosts({
        filter:
          feed() === "following"
            ? `author.followers ~ "${api.authStore.model.id}"`
            : `author.id != "${api.authStore.model.id}"`,
      }, true);
    });

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", (e) => {
      if (e.touches[0].clientY < 50) setRefresh(true);
    });
    window.addEventListener("touchend", () => setRefresh(false));

    onCleanup(() => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", handleScroll);
    });
  });

  function changeFeed(type: string) {
    setFeed(type);
  }

  return {
    feed,
    setFeed,
    changeFeed,
    currentPage,
    posts,
    setPosts,
    loading,
    error,
    hasMore,
    refresh,
    reset,
    fetchPosts,
    totalPages,
    totalItems,
  };
}
