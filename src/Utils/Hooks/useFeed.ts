import { api } from "@/src";
import { createEffect, createSignal } from "solid-js";
import { HttpCodes } from "../SDK/opCodes";

async function list(
  collection: any,
  currentPage: number,
  feed: any,
  options: { filter?: string; sort?: string } = {}
) {
  return new Promise((resolve, reject) => {
    api
      .collection(collection)
      .list(currentPage, 10, {
        recommended: true,
        order: options.sort || "createdAt",
        filter: options.filter || "author.deactivated=false",
        cacheKey: `${collection}_${feed()}_${currentPage}_feed`,
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
      .then((data: any) => {
        if (data.opCode !== HttpCodes.OK) {
          console.log(data);
          reject(data);
        }
        resolve(data);
      })
      .catch(reject);
  });
}

export default function useFeed(
  collection: string,
  options: { _for?: string; filter?: string; sort?: string } = {}
) {
  const [feed, setFeed] = createSignal(
    options._for === "home" ? "recommended" : "all"
  );
  const [currentPage, setCurrentPage] = createSignal(1, { equals: false });
  const [posts, setPosts] = createSignal<any[]>([], { equals: false });
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [hasMore, setHasMore] = createSignal(true);
  const [refresh, setRefresh] = createSignal(false);
  const [totalPages, setTotalPages] = createSignal(0);

  function reset() {
    setPosts([]);
    setCurrentPage(1);
    setHasMore(true);
  }

  function fetchPosts(options: any, resetFlag: boolean) {
    if (resetFlag) {
       setCurrentPage(1);
       setLoading(true)
    }
    list(collection, resetFlag ? 1 : currentPage(), feed, options)
      .then((data: any) => {
        if (resetFlag) {
          setPosts(data.items);
        } else { 
          setPosts([...posts(), ...data.items]);
        }

        for (let i = 0; i < data?.items.length; i++) {
          api.collection("posts").subscribe(data.items[i].id, {
            cb() {},
          });
        }

        setLoading(false);
        setTotalPages(data.totalPages || 0);

        let relevantPeople: any[] = [];
        for (let i = 0; i < data?.items.length; i++) {
          if (data?.items[i].expand.author.followers.length < 1) continue;
          let followers = data?.items[i].expand.author.expand.followers;
          if (followers.length < 1) continue;
          for (let j = 0; j < followers.length; j++) {
            if (
              followers[j].id !== api.authStore.model.id &&
              relevantPeople.length < 5 &&
              !followers[j].followers.includes(api.authStore.model.id) &&
              !relevantPeople.find((i) => i.id === followers[j].id)
              && !followers[j].deactivated
            ) {
              relevantPeople.push(followers[j]);
            }
          }
        }

        // @ts-ignore
        window.setRelevantPeople && setRelevantPeople(relevantPeople);
      })
      .catch((e) => {
        console.log(e);
        setError(e);
      });
  }

  createEffect(() => {
    window.addEventListener("popstate", () => {
      setLoading(true);
      setPosts([]);
      setCurrentPage(1);
      setHasMore(true);
    });

    let scrollTimeout: any = null;

    function handleScroll() {
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(async () => {
        scrollTimeout = null;

        if (loading() || refresh()) return;

        console.log("scrolling", currentPage(), totalPages(), hasMore());

        if (totalPages() <= currentPage()) {
          setHasMore(false);
        } else if (totalPages() > currentPage() && !hasMore()) {
          setHasMore(true);
        }

        if (
          window.innerHeight + window.scrollY <
          document.body.offsetHeight - 100
        ) {
          console.log("not at bottom, skipping fetch");
          return;
        }

        if (hasMore() && totalPages() > currentPage()) {
          try {
            const nextPage = currentPage() + 1;
            console.log("next page value", nextPage);
            const data = await list(collection, nextPage, feed, options);
            setPosts([...posts(), ...data?.items]);
            setCurrentPage(nextPage);
            if (data.totalPages) {
              setTotalPages(data.totalPages);
            }
            if (data.totalPages <= nextPage) {
              setHasMore(false);
              setCurrentPage(data.totalPages);
            }
          } catch (e) {
            setError(e as any);
          } finally {
            setLoading(false);
          }
        }
      }, 300); // debounce: 300ms
    }

    window.addEventListener("scroll", handleScroll);

    function handleTouchStart(e: TouchEvent) {
      if (e.touches[0].clientY < 50) {
        setRefresh(true);
      }
    }
    function handleTouchEnd() {
      setRefresh(false);
    }

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    fetchPosts(
      {
        filter:
          feed() === "following"
            ? `author.followers ~ "${api.authStore.model.id}"`
            : `author.id  != "${api.authStore.model.id}"`,
      },
      true
    );
  });

  // Initial load outside the effect
  reset()
  fetchPosts(options, false);

  return { feed, currentPage, posts, loading, error, hasMore, setFeed, reset, setPosts };
}
