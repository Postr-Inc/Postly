 import {
  createSignal,
  createEffect,
  For,
  Match,
  Show,
  Switch,
  onCleanup,
} from "solid-js";
import { useNavigate } from "@solidjs/router";

import Page from "@/components/ui/Page";
import { api } from "@/src";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import Post from "@/components/ui/PostRelated/Post";

// Utility: Get query param from URL
const getQueryParam = () =>
  new URLSearchParams(window.location.search).get("q") || "";

// Hook: Track URL query parameter changes
function useQueryParam() {
  const [query, setQuery] = createSignal(getQueryParam());
  const onPopState = () => setQuery(getQueryParam());
  window.addEventListener("popstate", onPopState);
  onCleanup(() => window.removeEventListener("popstate", onPopState));
  return query;
}

async function fetchSearch(
  query: string
): Promise<{ users: any[]; posts: any[] }> {
  if (!query.trim()) return { users: [], posts: [] };
  try {
    const res = await api.deepSearch(["users", "posts"], query.trim());
    return res.results;
  } catch (err) {
    console.error("Search fetch error:", err);
    return { users: [], posts: [] };
  }
}

function UserResultItem({
  user,
  navigate,
}: {
  user: any;
  navigate: (p: string) => void;
}) {
  const handleNavigate = (e: any) => {
    if (e.target.tagName !== "BUTTON") navigate(`/u/${user.username}`);
  };

  return (
    <div
      onClick={handleNavigate}
      class="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 cursor-pointer transition-transform duration-200 hover:scale-[1.01] shadow-sm hover:shadow-md backdrop-blur-sm"
    >
      <img
        src={api.cdn.getUrl("users", user.id, user.avatar)}
        alt={user.username}
        class="w-12 h-12 rounded-full object-cover mt-1"
      />
      <div class="flex-1">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold text-sm text-zinc-900 dark:text-white">
              {user.name}
            </div>
            <div class="text-xs text-zinc-500">@{user.username}</div>
          </div>
          <button class="px-3 py-1 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-black rounded-full hover:opacity-90 relative z-10">
            Follow
          </button>
        </div>
        <div class="mt-1 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
          {user.bio || "—"}
        </div>
      </div>
    </div>
  );
}

export default function Search() {
  const { route, navigate } = useNavigation();
  const queryParam = useQueryParam();

  const [input, setInput] = createSignal(queryParam());
  const [activeTab, setActiveTab] = createSignal("Top");

  const [users, setUsers] = createSignal<any[]>([]);
  const [posts, setPosts] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  createEffect(() => {
    const q = queryParam();
    if (!q.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    setLoading(true);
    setError(null);
    fetchSearch(q)
      .then((res: any[]) => {
        const safeUsers = Array.isArray(res[0]?.users) ? res[0].users : [];
        const safePosts = Array.isArray(res[1]?.posts) ? res[1].posts : [];
        setUsers(safeUsers);
        setPosts(safePosts);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setUsers([]);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  });

  createEffect(() => setInput(queryParam()));

  const onSubmit = (e: Event) => {
    e.preventDefault();
    const q = input().trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Page {...{ route, navigate }}>
      {/* Sticky frosted search bar */}
      <div class="p-3 sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Search"
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            class="w-full px-4 py-2 rounded-full bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 backdrop-blur"
          />
        </form>
      </div>

      {/* Animated Tabs */}
      <div class="sticky top-[56px] flex border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
        <div class="relative flex w-full">
          {["Top", "Latest", "People", "Media", "Lists"].map((tab) => (
            <button
              onClick={() => setActiveTab(tab)}
              class={`relative flex-1 text-center py-3 text-sm font-bold transition-colors ${
                activeTab() === tab
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {tab}
              <Show when={activeTab() === tab}>
                <div class="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-full animate-slideIn"></div>
              </Show>
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div class="min-h-[calc(100vh-120px)] bg-gradient-to-b from-zinc-50/60 dark:from-zinc-950/60 to-transparent">
        <Show when={loading()}>
          <div class="p-4 text-center text-sm text-zinc-500 animate-pulse">
            Loading results...
          </div>
        </Show>

        <Show when={error()}>
          <div class="p-4 text-sm text-red-500">Error: {error()}</div>
        </Show>

        <Show when={!loading() && !error()}>
          <Switch>
            {/* People Tab */}
            <Match when={activeTab() === "People"}>
              <Show
                when={users().length > 0}
                fallback={
                  <div class="p-4 text-sm text-zinc-500 text-center">
                    No users found.
                  </div>
                }
              >
                <div class="space-y-2">
                  <For each={users()}>
                    {(user, i) => (
                      <div
                        class="fade-in"
                        style={{ "animation-delay": `${i() * 50}ms` }}
                      >
                        <UserResultItem user={user} navigate={navigate} />
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Match>

            {/* Top Tab */}
            <Match when={activeTab() === "Top"}>
              <Show
                when={users().length > 0 || posts().length > 0}
                fallback={
                  <div class="p-4 text-sm text-zinc-500 text-center">
                    No results found for "{queryParam()}".
                  </div>
                }
              >
                <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <Show when={users().length > 0}>
                    <div class="px-4 pt-4 pb-2 text-lg font-extrabold text-zinc-900 dark:text-white">
                      People
                    </div>
                    <For each={users().slice(0, 3)}>
                      {(user, i) => (
                        <div
                          class="fade-in"
                          style={{ "animation-delay": `${i() * 50}ms` }}
                        >
                          <UserResultItem user={user} navigate={navigate} />
                        </div>
                      )}
                    </For>
                  </Show>

                  <Show when={posts().length > 0}>
                    <div class="px-4 pt-4 pb-2 text-lg font-extrabold text-zinc-900 dark:text-white">
                      Posts
                    </div>
                    <For each={posts()}>
                      {(post, i) => (
                        <div
                          class="fade-in"
                          style={{ "animation-delay": `${i() * 50}ms` }}
                        >
                          <Post {...post} navigate={navigate} />
                        </div>
                      )}
                    </For>
                  </Show>
                </div>
              </Show>
            </Match>

            {/* Latest Tab */}
            <Match when={activeTab() === "Latest"}>
              <Show
                when={posts().length > 0}
                fallback={
                  <div class="p-4 text-sm text-zinc-500 text-center">
                    No posts found.
                  </div>
                }
              >
                <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <For each={posts()}>
                    {(post, i) => (
                      <div
                        class="fade-in"
                        style={{ "animation-delay": `${i() * 50}ms` }}
                      >
                        <Post {...post} navigate={navigate} />
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Match>

            {/* Media & Lists Tabs */}
            <Match when={["Media", "Lists"].includes(activeTab())}>
              <div class="p-8 text-center text-sm text-zinc-500">
                <h3 class="font-bold text-lg text-zinc-800 dark:text-zinc-200">
                  Coming Soon!
                </h3>
                <p>Search for {activeTab()} is not available yet.</p>
              </div>
            </Match>
          </Switch>
        </Show>
      </div>

      {/* Animation Styles */}
      <style>
        {`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeInUp 0.3s ease both;
        }

        @keyframes slideIn {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease forwards;
          transform-origin: center;
        }
        `}
      </style>
    </Page>
  );
}
