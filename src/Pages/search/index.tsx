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

import Page from "@/src/Utils/Shared/Page";
import { api } from "@/src";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import Post from "@/src/components/PostRelated/Post";

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

async function fetchSearch(query: string): Promise<{ users: any[]; posts: any[] }> {
  if (!query.trim()) return { users: [], posts: [] };
  try {
    const res = await api.deepSearch(["users", "posts"], query.trim());
    return res;
  } catch (err) {
    console.error("Search fetch error:", err);
    return { users: [], posts: [] };
  }
}

function UserResultItem({ user, navigate }) {
  const handleNavigate = (e) => {
    if (e.target.tagName !== "BUTTON") {
      navigate(`/u/${user.username}`);
    }
  };

  return (
    <div
      onClick={handleNavigate}
      class="flex items-start gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
    >
      <img
        src={api.cdn.getUrl("users", user.id, user.avatar)}
        alt={user.username}
        class="w-12 h-12 rounded-full object-cover mt-1"
      />
      <div class="flex-1">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold text-sm text-zinc-900 dark:text-white">{user.name}</div>
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
      .then((res) => {
        const safeUsers = Array.isArray(res?.users) ? res.users : [];
        const safePosts = Array.isArray(res?.posts) ? res.posts : [];
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

  createEffect(() => {
    setInput(queryParam());
  });

  const onSubmit = (e: Event) => {
    e.preventDefault();
    const q = input().trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <Page {...{ route, navigate }}>
      <div class="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Search"
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            class="w-full p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </form>
      </div>

      <div class="sticky top-[56px] border-b border-zinc-200 dark:border-zinc-800 flex bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
        {["Top", "Latest", "People", "Media", "Lists"].map((tab) => (
          <button
            class={`flex-1 text-center py-3 text-sm font-bold transition-colors ${
              activeTab() === tab
                ? "border-b-2 border-blue-500 text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        <Show when={loading()}>
          <div class="p-4 text-center text-sm text-zinc-500">Loading...</div>
        </Show>

        <Show when={error()}>
          <div class="p-4 text-sm text-red-500">Error: {error()}</div>
        </Show>

        <Show when={!loading() && !error()}>
          <Switch>
            <Match when={activeTab() === "People"}>
              <Show
                when={users().length > 0}
                fallback={
                  <div class="p-4 text-sm text-zinc-500 text-center">No users found.</div>
                }
              >
                <For each={users()}>
                  {(user) => <UserResultItem user={user} navigate={navigate} />}
                </For>
              </Show>
            </Match>

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
                    <div class="px-4 pt-4 pb-2 text-lg font-extrabold text-zinc-900 dark:text-white">People</div>
                    <For each={users().slice(0, 3)}>
                      {(user) => <UserResultItem user={user} navigate={navigate} />}
                    </For>
                  </Show>

                  <Show when={posts().length > 0}>
                    <div class="px-4 pt-4 pb-2 text-lg font-extrabold text-zinc-900 dark:text-white">Posts</div>
                    <For each={posts()}>
                      {(post) => <Post {...post} navigate={navigate}  />}
                    </For>
                  </Show>
                </div>
              </Show>
            </Match>

            <Match when={activeTab() === "Latest"}>
              <Show
                when={posts().length > 0}
                fallback={
                  <div class="p-4 text-sm text-zinc-500 text-center">No posts found.</div>
                }
              >
                <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
                  <For each={posts()}>
                    {(post) => <Post  {...post}  navigate={navigate} />}
                  </For>
                </div>
              </Show>
            </Match>

            <Match when={["Media", "Lists"].includes(activeTab())}>
              <div class="p-8 text-center text-sm text-zinc-500">
                <h3 class="font-bold text-lg text-zinc-800 dark:text-zinc-200">Coming Soon!</h3>
                <p>Search for {activeTab()} is not available yet.</p>
              </div>
            </Match>
          </Switch>
        </Show>
      </div>
    </Page>
  );
}
