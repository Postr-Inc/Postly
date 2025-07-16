import { api } from "@/src";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { createSignal, For, Match, Show, Switch } from "solid-js"; 
import Search from "../../Icons/search";
export function SideBarRight(props:  {
    params: any;
    route: any;
    navigate: any;
}) { 
    const { theme } = useTheme();
    const { params, route, navigate } = props;
    const [RelevantPeople, setRelevantPeople] = createSignal([], {equals: false}) as any[]; 
    const [RelevantText, setRelevantText] = createSignal("Relevant People", {equals: false}) 
    //@ts-ignore
    window.setRelevantPeople = setRelevantPeople;
    window.setRelevantText = setRelevantText;
    let [searchQuery, setSearchQuery] = createSignal("");
    let [searchResults, setSearchResults] = createSignal({posts: [], users: []});
    let [searching, setSearching] = createSignal(false);
    let [searchError, setSearchError] = createSignal("");
    let [recentSearches, setRecentSearches] = createSignal(localStorage.getItem("recentSearches") ? JSON.parse(localStorage.getItem("recentSearches") as string) : []);

    async function search() {
      if (!searchQuery()) {
        setSearchError("Please enter a search query");
        return;
      }
      setSearching(true);
      try {
        let results = await api.deepSearch(["users", "posts"], searchQuery()) as any[];
        let posts = []
        let users = []
        results.forEach((result) => {
          if (result.collectionName === "posts") {
            posts.push(result);
          } else {
            users.push(result);
          }
        });
        
        setSearchResults({posts, users});
        setRecentSearches([...recentSearches(), searchQuery()]);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches()));
        setSearching(false);
      } catch (error) {
        setSearchError("An error occured. Please try again later.");
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
            <ul class="p-2   w-80  min-h-full gap-5 flex flex-col   text-base-content">
              {/* Sidebar content here */}
              <li onBlur={()=> document.getElementById("searchResults")?.style.setProperty("display", "none") }>
                  <input type="text" class="w-full input input-ghost rounded-full input-bordered" placeholder="Search" 
                  onFocus={()=> document.getElementById("searchResults")?.style.setProperty("display", "block") }
                  onInput={(e: any) => setSearchQuery(e.target.value)} 
                  onKeyDown={(e: any) => e.key === "Enter" && search()}
                  />
     
                  <div class="w-full flex flex-col bg-base-200 border-black border  p-5 rounded-xl mt-2 " id="searchResults"
                  style={{display: "none"}}
                  >
                    <Show when={searching()}>
                      <div class="flex flex-col items-center gap-5">
                        <div class="spinner spinner-primary"></div>
                        <p>Searching...</p>
                      </div>
                    </Show>
                    <Show when={searchError()}>
                      <div class="flex flex-col items-center gap-5">
                        <p>{searchError()}</p>
                      </div>
                    </Show>
                    <Show when={searchResults().posts && searchResults().posts.length === 0 && searchResults().users && searchResults().users.length === 0 && recentSearches().length > 0}>
                      <div class="flex flex-col gap-5"> 
                        <div class="flex flex-row gap-5 items-center justify-between">
                          <h1 class="font-bold">Recent Searches</h1>
                          <button onClick={()=> setRecentSearches([])} class="text-sm text-blue-500">Clear All</button>
                        </div>
                        <For each={recentSearches()}>
                          {(item) => (
                            <div class="flex flex-row gap-5" onClick={()=> navigate(`/search?q=${item}`)}>
                              <Search class="w-5 h-5" />
                              <p>{item}</p>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                    <Show when={searchResults().posts && searchResults().posts.length === 0 && searchResults().users && searchResults().users.length === 0 && recentSearches().length  < 1}>
                      <div class="flex flex-col items-center gap-5">
                        <p>Try searching for people, posts, or tags</p>
                      </div>
                    </Show>
                   <div class="flex flex-col gap-5">
                     <Show when={searchResults().posts && searchResults().posts.length > 0}>
                      <For each={SearchSuggestions(searchResults().posts, searchQuery())}>
                        {(item) => (
                          <div class="flex flex-row gap-5" onClick={()=> navigate(`/search?q=${item}`)}>
                            <Search class="w-5 h-5" />
                            <p>{item}</p>
                          </div>
                        )}
                      </For>
                    </Show>
                    <hr />
                    <Show when={searchResults().users && searchResults().users.length > 0}>
                      <For each={searchResults().users}>
                        {(item) => (
                          <div class="flex flex-row gap-5">
                            <Switch>
                              <Match when={!item.avatar}>
                                <div class="w-10 h-10 border text-center p-2 rounded">
                                  {item.username.slice(0, 1).charAt(0).toUpperCase()}
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
                            <div class="flex flex-col cursor-pointer" onClick={()=>  navigate(`/u/${item.username}`, {id: item.username})}>
                              <a class="font-bold">{item.username}</a> 
                              <p class="text-sm">@{item.username}</p>
                            </div>
                          </div>
                        )}
                      </For>
                    </Show>
                  </div>
                  </div>
              </li>
                <Switch>
  {/* ✅ 1️⃣ Loading state */}
  <Match when={!RelevantPeople() || RelevantPeople().length === 0}>
    <li
      class={`
        ${
          theme() === 'dark'
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
        ${
          theme() === 'dark'
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
                  <a class="cursor-pointer hover:underline">
                    Terms of service
                  </a>
                  <a
                    href="/information/privacy.pdf"
                    class="cursor-pointer hover:underline"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li class="flex flex-row gap-5">
                  <a href="" class="cursor-pointer hover:underline">
                    Help and safety
                  </a>
                  <a class="cursor-pointer hover:underline">Accessibility</a>
                </li>
                <li>
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
