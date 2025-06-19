import { api } from "@/src";
import { createEffect, createSignal, onMount } from "solid-js";
import { HttpCodes } from "../SDK/opCodes";

async function list(
  collection: string,
  page: number,
  feed: () => string,
  options: { filter?: string; sort?: string } = {}
) {
  return api
    .collection(collection)
    .list(page, 10, {
      recommended: feed() === "recommended",
      order: options.sort || "-created",
      filter: options.filter || "author.deactivated=false",
      cacheKey: `${collection}_${feed()}_${page}_feed_${api.authStore.model.id || api.authStore.model.token.split(".")}`,
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
  options: { _for?: string; filter?: string; sort?: string } = {}
) {
  const [feed, setFeed] = createSignal(options._for === "home" ? "recommended" : "all");
  const [currentPage, setCurrentPage] = createSignal(1);
  const [posts, setPosts] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);
  const [hasMore, setHasMore] = createSignal(true);
  const [refresh, setRefresh] = createSignal(false);
  const [totalPages, setTotalPages] = createSignal(0);

  function reset() {
    setPosts([]);
    setCurrentPage(1);
    setHasMore(true);
  }

  async function fetchPosts(fetchOptions: any = {}, resetFlag = false) {
    try {
      if (resetFlag) {
        setLoading(true);
        setCurrentPage(1);
        reset();
      }

      const page = resetFlag ? 1 : currentPage();
      const data = await list(collection, page, feed, fetchOptions);

      // Deduplicate posts by ID
      const existingIds = new Set(posts().map(post => post.id));
      const newItems = data.items.filter((item: any) => !existingIds.has(item.id));

      setPosts(resetFlag ? data.items : [...posts(), ...newItems]);
      setTotalPages(data.totalPages || 0);

      if (data.totalPages <= page) {
        setHasMore(false);
      }

      // Subscribe to new post updates
      data.items.forEach((item: any) => {
        api.collection("posts").subscribe(item.id, { cb() {} });
      });

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
      setLoading(false);
      setRefresh(false);
    }
  }

  onMount(() => {
    createEffect(() => {
      // Handle back navigation
      window.addEventListener("popstate", () => {
        reset();
        fetchPosts({
          filter:
            feed() === "following"
              ? `author.followers ~ "${api.authStore.model.id}"`
              : `author.id != "${api.authStore.model.id}"`,
        }, true);
      });

      let scrollTimeout: any = null;

      async function handleScroll() {
        if (scrollTimeout || loading() || refresh()) return;

        scrollTimeout = setTimeout(async () => {
          scrollTimeout = null;

          if (window.innerHeight + window.scrollY < document.body.offsetHeight) return;

          if (hasMore() && totalPages() > currentPage()) {
            const nextPage = currentPage() + 1;
            const data = await list(collection, nextPage, feed, options);

            const existingIds = new Set(posts().map(post => post.id));
            const newItems = data.items.filter((item: any) => !existingIds.has(item.id));

            setPosts([...posts(), ...newItems]);
            setCurrentPage(nextPage);
            setTotalPages(data.totalPages || totalPages());

            if (data.totalPages <= nextPage) {
              setHasMore(false);
            }
          }
        }, 300);
      }

      window.addEventListener("scroll", handleScroll);
      window.addEventListener("touchstart", e => {
        if (e.touches[0].clientY < 50) setRefresh(true);
      });
      window.addEventListener("touchend", () => setRefresh(false));

      // Initial fetch
      fetchPosts(
        {
          filter:
            feed() === "following"
              ? `author.followers ~ "${api.authStore.model.id}"`
              : `author.id != "${api.authStore.model.id}"`,
        },
        true
      );
    });

    // Second fetch just in case (safe redundancy)
    reset();
    fetchPosts(options, false);
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
