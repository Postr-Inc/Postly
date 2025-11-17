import { api } from "@/src";
import useTheme from "@/src/Utils/Hooks/useTheme";
import {
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  For,
  Match,
  Show,
  Switch,
} from "solid-js";
import Search from "@/components/Icons/search";

export function useClickOutside(
  ref: () => HTMLElement | undefined | null,
  handler: () => void,
) {
  const handleClick = (e: MouseEvent) => {
    const el = ref();
    if (!el || el.contains(e.target as Node)) return;
    handler();
  };

  onMount(() => {
    document.addEventListener("mousedown", handleClick);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleClick);
  });
}

export function SideBarRight(props: {
  params: any;
  route: any;
  navigate: any;
}) {
  const { theme } = useTheme();
  const { navigate } = props;

  const [RelevantPeople, setRelevantPeople] = createSignal([], {
    equals: false,
  }) as any[];
  const [RelevantText, setRelevantText] = createSignal("Relevant People", {
    equals: false,
  });
  //@ts-ignore
  window.setRelevantPeople = setRelevantPeople;
  //@ts-ignore
  window.setRelevantText = setRelevantText;

  const [searchQuery, setSearchQuery] = createSignal("");
  const [searchResults, setSearchResults] = createSignal({
    posts: [],
    users: [],
  });
  const [searching, setSearching] = createSignal(false);
  const [searchError, setSearchError] = createSignal("");
  const [recentSearches, setRecentSearches] = createSignal(
    localStorage.getItem("recentSearches")
      ? JSON.parse(localStorage.getItem("recentSearches") as string)
      : [],
  );
  const [showResults, setShowResults] = createSignal(false);
  const [hasSearched, setHasSearched] = createSignal(false);

  let containerRef: HTMLLIElement | undefined;
  useClickOutside(
    () => containerRef,
    () => {
      setShowResults(false);
      setSearchResults({ posts: [], users: [] });
      setRecentSearches(
        localStorage.getItem("recentSearches")
          ? JSON.parse(localStorage.getItem("recentSearches") as string)
          : [],
      );
      //@ts-ignore
      document.getElementById("searchInput").value = "";
      setSearchQuery("");
      setHasSearched(false);
    },
  );

  let debounceTimeout: NodeJS.Timeout;

  createEffect(() => {
    const query = searchQuery().trim();
    clearTimeout(debounceTimeout);
    if (!query || query.length < 2) {
      setHasSearched(false);
      setSearchResults({ posts: [], users: [] });
      return;
    }

    debounceTimeout = setTimeout(() => {
      search();
    }, 500);
  });

  onCleanup(() => {
    clearTimeout(debounceTimeout);
  });

  async function search() {
    if (!searchQuery()) {
      setSearchError("Please enter a search query");
      return;
    }

    setSearchError("");
    setSearching(true);
    setHasSearched(true);

    try {
      const res = (await api.deepSearch([
        "users",
        "posts",
      ], searchQuery().trim())) as any;
      // Normalize shape to { users: [], posts: [] }
      const users = Array.isArray(res?.results?.[0]?.users)
        ? res.results[0].users
        : Array.isArray(res?.users)
        ? res.users
        : [];
      const posts = Array.isArray(res?.results?.[1]?.posts)
        ? res.results[1].posts
        : Array.isArray(res?.posts)
        ? res.posts
        : [];
      setSearchResults({ users, posts });

      const query = searchQuery();
      if (!recentSearches().includes(query)) {
        const updatedSearches = [...recentSearches(), query];
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      }
    } catch (error) {
      console.error("search error", error);
      setSearchError("An error occurred. Please try again later.");
      setSearchResults({ users: [], posts: [] });
    } finally {
      setSearching(false);
    }
  }

  function SearchSuggestions(
    array: { content: string }[],
    searchQuery: string,
  ): string[] {
    const suggestions: string[] = [];

    array.forEach((post) => {
      const matchingWords = post.content
        .split(/\s+/)
        .filter((word) =>
          word.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      suggestions.push(...matchingWords);
    });

    return [...new Set(suggestions)];
  }

  function resetRecentSearches() {
    setRecentSearches([]);
    localStorage.setItem("recentSearches", JSON.stringify([]));
  }

  return (
    <div class="xl:drawer md:p-2 xl:w-auto xl:drawer-end xl:drawer-open lg:drawer-open mx-5">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
      <div class="fixed top-0 overflow-hidden">
        <label
          for="my-drawer-2"
          aria-label="close sidebar"
          class="drawer-overlay"
        ></label>
        <ul class="p-2 w-80 min-h-full gap-5 flex flex-col text-base-content">
          {/* 🔍 Search Input */}
          <li
            ref={(el) => (containerRef = el)}
            class="relative w-full max-w-lg"
          >
            <input
              type="text"
              id="searchInput"
              class="w-full input input-bordered rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search..."
              onFocus={() => {
                setShowResults(true);
              }}
              onInput={(e: any) => {
                const val = e.target.value;
                setSearchQuery(val);
                setShowResults(true);
                if (!val.trim()) {
                  setSearchResults({ posts: [], users: [] });
                  setHasSearched(false);
                }
              }}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  navigate(`/search?q=${searchQuery()}`);
                  setShowResults(false);
                }
              }}
            />

            <Show when={showResults()}>
              <div class="absolute z-50 w-full bg-base-100 border border-base-300 shadow-lg rounded-xl mt-2 p-4 space-y-2 max-h-[400px] overflow-auto">
                <Show when={searching()}>
                  <div class="flex flex-col items-center gap-3">
                    <div class="loading-spinner spinner-primary"></div>
                    <p class="text-sm text-neutral-content">Searching...</p>
                  </div>
                </Show>

                <Show when={searchError()}>
                  <p class="text-red-500 text-center">{searchError()}</p>
                </Show>

                {/* 🔍 Recent Searches */}
                <Show
                  when={
                    !searching() &&
                    searchQuery().trim() === "" &&
                    recentSearches().length > 0
                  }
                >
                  <div>
                    <div class="flex justify-between items-center mb-2">
                      <h2 class="font-semibold text-sm">Recent Searches</h2>
                      <button
                        class="text-xs text-error hover:underline"
                        onClick={() => resetRecentSearches()}
                      >
                        Clear
                      </button>
                    </div>
                    <For each={recentSearches()}>
                      {(query) => (
                        <div
                          class="flex items-center justify-between p-2 hover:bg-base-200 rounded cursor-pointer"
                          onMouseDown={() => {
                            setSearchQuery(query);
                            navigate(`/search?q=${query}`);
                            setShowResults(false);
                          }}
                        >
                          <p>{query}</p>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>

                <Show when={!searching() && searchQuery().trim() !== ""}>
                  <div
                    class="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer"
                    onMouseDown={() => {
                      navigate(`/search?q=${searchQuery()}`);
                      setShowResults(false);
                    }}
                  >
                    <Search class="w-5 h-5" />
                    <p class="font-semibold">Search for "{searchQuery()}"</p>
                  </div>
                </Show>

                <Show when={!searching() && searchResults().users.length > 0}>
                  <hr class="border-base-300" />
                  <div>
                    <h2 class="font-semibold text-sm mb-1">Users</h2>
                    <For each={searchResults().users}>
                      {(user) => (
                        <div
                          class="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer"
                          onMouseDown={() => {
                            navigate(`/u/${user.username}`);
                            setShowResults(false);
                          }}
                        >
                          <Switch>
                            <Match when={!user.avatar}>
                              <div class="w-10 h-10 bg-base-300 flex items-center justify-center rounded-full text-sm font-semibold">
                                {user.username.slice(0, 1).toUpperCase()}
                              </div>
                            </Match>
                            <Match when={user.avatar}>
                              <img
                                class="w-10 h-10 rounded-full object-cover"
                                src={api.cdn.getUrl(
                                  "users",
                                  user.id,
                                  user.avatar,
                                )}
                                alt={user.username}
                              />
                            </Match>
                          </Switch>
                          <div>
                            <p class="font-semibold">{user.username}</p>
                            <p class="text-sm text-neutral-content">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>

                <Show
                  when={
                    !searching() &&
                    searchResults().users.length === 0 &&
                    hasSearched()
                  }
                >
                  <p class="text-center text-sm text-neutral-content pt-2">
                    No users found for "{searchQuery()}"
                  </p>
                </Show>
              </div>
            </Show>
          </li>

          {/* 🔥 Relevant People Section (unchanged) */}
          <Switch>
            <Match when={!RelevantPeople() || RelevantPeople().length === 0}>
              <li
                class={`${theme() === "dark" ? "xl:border xl:border-[#121212]" : "xl:border xl:border-[#d3d3d3d8]"} p-5 rounded-xl`}
              >
                <h1 class="font-bold text-lg">{RelevantText()}</h1>
                <div class="flex flex-col mt-5 gap-4">
                  <div class="animate-pulse flex flex-col gap-4">
                    <div class="flex gap-4">
                      <div class="w-10 h-10 rounded bg-base-200"></div>
                      <div class="flex-1 h-4 bg-base-200 rounded"></div>
                    </div>
                    <div class="flex gap-4">
                      <div class="w-10 h-10 rounded bg-base-200"></div>
                      <div class="flex-1 h-4 bg-base-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </li>
            </Match>
            <Match when={RelevantPeople() && RelevantPeople().length > 0}>
              <li
                class={`${theme() === "dark" ? "xl:border xl:border-[#121212]" : "xl:border xl:border-[#d3d3d3d8]"} p-5 rounded-xl`}
              >
                <h1 class="font-bold text-lg">{RelevantText()}</h1>
                <div class="flex flex-col mt-5 gap-5">
                  <For each={RelevantPeople()}>
                    {(item) => (
                      <div class="flex flex-row gap-5">
                        <Switch>
                          <Match when={!item.avatar}>
                            <div class="w-10 h-10 border text-center p-2 rounded">
                              {item.username.slice(0, 1).toUpperCase()}
                            </div>
                          </Match>
                          <Match when={item.avatar}>
                            <img
                              class="w-10 h-10 rounded"
                              src={api.cdn.getUrl(
                                "users",
                                item.id,
                                item.avatar,
                              )}
                              alt={item.username}
                            />
                          </Match>
                        </Switch>
                        <div
                          class="flex flex-col cursor-pointer"
                          onClick={() => navigate(`/u/${item.username}`)}
                        >
                          <span class="font-bold">{item.username}</span>
                          <p class="text-sm">@{item.username}</p>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </li>
            </Match>
          </Switch>

          {/* Footer links (unchanged) */}
          <a
            href="https://www.producthunt.com/products/postly-5?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-postly&#0045;7"
            target="_blank"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=981494&theme=light&t=1750508772558"
              alt="Postly Product Hunt"
              style="width: 250px; height: 54px;"
              width="250"
              height="54"
            />
          </a>
          <div class="flex flex-col gap-5 mt-2 p-2 text-sm">
            <li class="flex flex-row gap-5">
              <a
                href="/information/terms.pdf"
                target="_blank"
                class="cursor-pointer hover:underline"
              >
                Terms of service
              </a>
              <a
                href="/information/privacy.pdf"
                target="_blank"
                class="cursor-pointer hover:underline"
              >
                Privacy Policy
              </a>
            </li>
            <li class="flex flex-row gap-5">
              <a
                onclick={() => navigate("/safety")}
                class="cursor-pointer hover:underline"
              >
                Help and safety
              </a>
              <a class="cursor-pointer hover:underline">Accessibility</a>
            </li>
            <li class="flex flex-row gap-5">
              <div class="tooltip cursor-pointer" data-tip="Your app version">
                pkg version: {window?.postr?.version}
              </div>
              <div
                class="tooltip cursor-pointer"
                data-tip="View Service Statuses"
              >
                <a
                  class="cursor-pointer hover:underline"
                  onClick={() => navigate("/status")}
                >
                  Status Page
                </a>
              </div>
            </li>
            <li>
              <a>
                © 2022 - {new Date().getFullYear()} Pascal. All rights reserved
              </a>
            </li>
          </div>
        </ul>
      </div>
    </div>
  );
}
