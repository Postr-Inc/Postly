import { api } from "..";
import HomeNav from "../components/Navbars/HomeNav";
import Page from "../Utils/Shared/Page";
import useNavigation from "../Utils/Hooks/useNavigation";
import { createEffect, createSignal, ErrorBoundary, For, Match, Switch, onMount, Show } from "solid-js";
import useFeed from "../Utils/Hooks/useFeed";
import Post from "../components/PostRelated/Post";
import LoadingIndicator from "../components/Icons/loading";
import { joinClass } from "../Utils/Joinclass";
export default function Home() {
  const { route, params, navigate } = useNavigation("/");
  const { feed, currentPage, setFeed, posts, loading, reset } = useFeed("posts", { filter: `author.id !="${api.authStore.model.id}" && author.deactivated=false`, _for: "home" });

  onMount(() => {
    createEffect(() => {
      window.onbeforeunload = function () {
        window.scrollTo(0, 0);
      }
    });

  })

  return (
    <Page {...{ navigate, params, route: route }} id={feed()}>
      <HomeNav navigate={navigate} page={feed} swapFeed={setFeed} />
      <Switch>
        <Match when={!loading()}>
          <div class="flex flex-col    gap-5 ">
            <Show when={posts()}>
               <For each={posts()}>
              {(item, index) => <div class={joinClass(index() == posts().length - 1 ? "sm:mb-[90px]" : "")}>   <Post {...{ navigate, route, params, isLast: true, ...item, id: item.id }} />  </div>}
            </For>
            </Show>
            <Show when={posts().length < 1 && feed() === "following"}>
              <div class="text-center text-gray-500 dark:text-gray-400 mt-10">
                Once you start following people, their posts will appear here!
              </div>
            </Show>
            <Show when={posts().length < 1 && feed() === "trending"}>
              <div class="text-center text-gray-500 dark:text-gray-400 mt-10">
                No trending posts available at the moment.
              </div>
            </Show>
            <Show when={posts().length < 1 && feed() === "recommended"}>
              <div class="text-center text-gray-500 dark:text-gray-400 mt-10">
                No recommended posts available at the moment.
              </div>
            </Show>
          </div>
        </Match>
        <Match when={loading()}>
          <For each={Array.from({ length: 10 })}>
            {() => <LoadingIndicator />}
          </For>
        </Match>
      </Switch>
    </Page>
  );
}
