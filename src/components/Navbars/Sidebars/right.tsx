import { api } from "@/src";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { createSignal, onMount, For, Match, Show, Switch, } from "solid-js";
import { onCleanup } from "solid-js";

export function useClickOutside(ref: () => HTMLElement | undefined | null, handler: () => void) {
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
import Search from "../../Icons/search";
export function SideBarRight(props: {
  params: any;
  route: any;
  navigate: any;
}) {
  const { theme } = useTheme();
  const { params, route, navigate } = props;
  const [RelevantPeople, setRelevantPeople] = createSignal([], { equals: false }) as any[];
  const [RelevantText, setRelevantText] = createSignal("Relevant People", { equals: false })
  //@ts-ignore
  window.setRelevantPeople = setRelevantPeople;
  //@ts-ignore
  window.setRelevantText = setRelevantText;
  let [searchQuery, setSearchQuery] = createSignal("");
  let [searchResults, setSearchResults] = createSignal({ posts: [], users: [] });
  let [searching, setSearching] = createSignal(false);
  let [searchError, setSearchError] = createSignal("");
  let [recentSearches, setRecentSearches] = createSignal(localStorage.getItem("recentSearches") ? JSON.parse(localStorage.getItem("recentSearches") as string) : []);
  let [showResults, setShowResults] = createSignal(false);
  const [hasSearched, setHasSearched] = createSignal(false);
  let containerRef: HTMLLIElement | undefined;

  useClickOutside(() => containerRef, () => {
    setShowResults(false)
    setSearchResults({ posts: [], users: [] })
    setRecentSearches(localStorage.getItem("recentSearches") ? JSON.parse(localStorage.getItem("recentSearches") as string) : [])
    //@ts-ignore
    document.getElementById("searchInput").value = ""
    setHasSearched(false)
  });
  async function search() {
    if (!searchQuery()) {
      setSearchError("Please enter a search query");
      return;
    }

    setSearchError("");
    setSearching(true);
    setHasSearched(true);
    console.log("search started");

    try {
      let results = await api.deepSearch(["users"], searchQuery()) as any[];
      console.log("results received:", results);
      let users = results;
      setSearchResults({ users });
      if (!recentSearches().includes(searchQuery())) {
        setRecentSearches([...recentSearches(), searchQuery()]);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches()));
      }
    } catch (error) {
      console.error("search error", error);
      setSearchError("An error occurred. Please try again later.");
      setSearchResults({ users: [], posts: [] });
    } finally {
      console.log("search ended, setting searching false");
      setSearching(false);
    }
  }


  function SearchSuggestions(array: { content: string }[], searchQuery: string): string[] {
    // Initialize an empty array to store matching suggestions
    const suggestions: string[] = [];

    array.forEach((post) => {
      // Split content into words and filter words that include the search query
      const matchingWords = post.content
        .split(/\s+/) // Split by spaces (handles multiple spaces)
        .filter((word) => word.toLowerCase().includes(searchQuery.toLowerCase())); // Case-insensitive match

      // Add matching words to suggestions
      suggestions.push(...matchingWords);
    });

    // Return unique suggestions to avoid duplicates
    return [...new Set(suggestions)];
  }

  function resetRecentSearches() {
    setRecentSearches([])
    localStorage.setItem("recentSearches", JSON.stringify([]));
  }

  function randomSearchSuggestions(query: string) {
    // Generate a random suffix of 1 to 10 characters from letters
    const randomLength = Math.floor(Math.random() * 10) + 1;
    const randomChars = Array.from({ length: randomLength }, () =>
      String.fromCharCode(97 + Math.floor(Math.random() * 26))
    ).join("");

    const newQuery = query + randomChars;

    return (
      <div class="flex flex-row gap-5">
        <Search class="w-5 h-5" />
        <div class="w-10 h-10 border text-center p-2 rounded">
          {newQuery.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <>
      <div class="xl:drawer  md:p-2  xl:w-[auto] xl:drawer-end xl:drawer-open lg:drawer-open  mx-5   ">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-side fixed top-0 overflow-hidden">
          <label
            for="my-drawer-2"
            aria-label="close sidebar"
            class="drawer-overlay"
          ></label>
          <ul class="p-2   w-80  min-h-full gap-5 flex flex-col   text-base-content" >
            {/* Sidebar content here */}
            <li ref={el => containerRef = el} class="relative w-full max-w-lg">
              <input
                type="text"
                class="w-full input input-bordered rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search..."
                onFocus={() => setShowResults(true)}
                id="searchInput"
                onInput={(e: any) => setSearchQuery(e.target.value)}
                onKeyDown={(e: any) => {
                  if (e.key == "Enter") {

                    e.preventDefault();
                    search()
                  }
                }}
              />

              <Show when={showResults()}>
                <div
                  id="searchResults"
                  class="absolute z-50 w-full bg-base-100 border border-base-300 shadow-lg rounded-xl mt-2 p-4 space-y-4 transition-all duration-200"
                >
                  <Show when={searching()}>
                    <div class="flex flex-col items-center gap-3">
                      <div class="loading-spinner  spinner-primary"></div>
                      <p class="text-sm text-neutral-content">Searching...</p>
                    </div>
                  </Show>

                  <Show when={searchError()}>
                    <p class="text-red-500 text-center">{searchError()}</p>
                  </Show>

                  <Show when={searchResults().posts?.length === 0 && searchResults().users?.length === 0 && recentSearches().length > 0}>
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <h2 class="font-semibold text-sm">Recent Searches</h2>
                        <button onClick={() => resetRecentSearches()} class="text-xs text-blue-500 hover:underline">
                          Clear All
                        </button>
                      </div>
                      <div class="flex flex-col gap-2">
                        <For each={recentSearches()}>
                          {(item) => (
                            <div
                              class="flex items-center gap-2 p-2 hover:bg-base-200 rounded cursor-pointer"
                              onClick={(e) => navigate(`/search?q=${item}`)}
                            >
                              <Search class="w-4 h-4" />
                              <p class="text-sm">{item}</p>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  <Show
                    when={!searching() && hasSearched() && searchQuery() !== ""}
                  >
                    {
                      (searchResults().posts && searchResults().posts.length === 0 && searchResults().users.length === 0)
                        ? <p class="text-center text-sm text-neutral-content">
                          No results found for '{searchQuery()}'
                        </p>
                        : null
                    }
                  </Show>

                  <Show
                    when={!hasSearched() && recentSearches().length === 0}
                  >
                    <p class="text-center text-sm text-neutral-content">
                      Try searching for people, posts, or tags
                    </p>
                  </Show>


                  <div class="space-y-3">
                    <Show when={searchResults().posts?.length > 0}>
                      <div>
                        <h2 class="font-semibold text-sm mb-1">Post Suggestions</h2>
                        <For each={SearchSuggestions(searchResults().posts, searchQuery())}>
                          {(item) => (
                            <div
                              class="flex items-center gap-2 p-2 hover:bg-base-200 rounded cursor-pointer"
                              onClick={() => navigate(`/search?q=${item}`)}
                            >
                              <Search class="w-4 h-4" />
                              <p class="text-sm">{item}</p>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>

                    <Show when={searchResults().users?.length > 0}>
                      <hr class="border-base-300" />
                      <div>
                        <h2 class="font-semibold text-sm mb-1">Users</h2>
                        <For each={searchResults().users}>
                          {(user) => (
                            <div class="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer">
                              <Switch>
                                <Match when={!user.avatar}>
                                  <div class="w-10 h-10 bg-base-300 flex items-center justify-center rounded-full text-sm font-semibold">
                                    {user.username.slice(0, 1).toUpperCase()}
                                  </div>
                                </Match>
                                <Match when={user.avatar}>
                                  <img
                                    class="w-10 h-10 rounded-full object-cover"
                                    src={api.cdn.getUrl("users", user.id, user.avatar)}
                                    alt={user.username}
                                  />
                                </Match>
                              </Switch>
                              <div onClick={() => navigate(`/u/${user.username}`, { id: user.username })}>
                                <p class="font-semibold">{user.username}</p>
                                <p class="text-sm text-neutral-content">@{user.username}</p>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>
              </Show>
            </li>

            <Switch>
              {/* ✅ 1️⃣ Loading state */}
              <Match when={!RelevantPeople() || RelevantPeople().length === 0}>
                <li
                  class={`
        ${theme() === 'dark'
                      ? 'xl:border xl:border-[#121212]'
                      : 'xl:border xl:border-[#d3d3d3d8]'
                    } p-5 rounded-xl
      `}
                >
                  <h1 class="font-bold text-lg">{RelevantText()}</h1>
                  <div class="flex flex-col mt-5 gap-4">
                    <div class="animate-pulse flex flex-col gap-4">
                      {/* Example shimmer placeholders */}
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

              {/* ✅ 2️⃣ Populated state */}
              <Match when={RelevantPeople() && RelevantPeople().length > 0}>
                <li
                  class={`
        ${theme() === 'dark'
                      ? 'xl:border xl:border-[#121212]'
                      : 'xl:border xl:border-[#d3d3d3d8]'
                    } p-5 rounded-xl
      `}
                >
                  <a class="w-full relative">
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
                                  src={api.cdn.getUrl("users", item.id, item.avatar)}
                                  alt={item.username}
                                />
                              </Match>
                            </Switch>
                            <div
                              class="flex flex-col cursor-pointer"
                              onClick={() =>
                                navigate(`/u/${item.username}`, { id: item.username })
                              }
                            >
                              <span class="font-bold">{item.username}</span>
                              <p class="text-sm">@{item.username}</p>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </a>
                </li>
              </Match>
            </Switch>


            <a href="https://www.producthunt.com/products/postly-5?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-postly&#0045;7" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=981494&theme=light&t=1750508772558" alt="Postly - Open&#0045;source&#0032;social&#0032;media&#0046;&#0032;No&#0032;ads&#0044;&#0032;no&#0032;tracking | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
            <div class="flex flex-col gap-5 mt-2 p-2 text-sm">
              <li class="flex flex-row gap-5">
                <a class="cursor-pointer hover:underline"
                  href="/information/terms.pdf"
                  target="_blank"
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
                <a href="" class="cursor-pointer hover:underline" onclick={() => navigate("/safety")}>
                  Help and safety
                </a>
                <a class="cursor-pointer hover:underline">Accessibility</a>
              </li>
              <li class="flex flex-row gap-5">
                <div
                  class="tooltip cursor-pointer"
                  data-tip="Your app version"
                >
                  pkg version:{" "}
                  {
                    // @ts-ignore
                    window?.postr?.version
                  }
                </div>
                <div
                  class="tooltip cursor-pointer"
                  data-tip="View Service Statuses"
                >
                  <a class="cursor-pointer hover:underline" onClick={() => navigate("/status")}> Status Page{" "} </a>
                </div>
              </li>

              <li>
                <a>
                  © 2022 - {new Date().getFullYear()} Pascal. All rights
                  reserved
                </a>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </>
  );
}
