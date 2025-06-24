import { api } from "..";
import HomeNav from "../components/Navbars/HomeNav";
import Page from "../Utils/Shared/Page";
import useNavigation from "../Utils/Hooks/useNavigation";
import { createEffect, createSignal, ErrorBoundary, For, Match, Switch, onMount } from "solid-js";
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
            <For each={posts()}>
              {(item, index) => <div class={joinClass(index() == posts().length - 1 ? "sm:mb-[90px]" : "")}>   <Post {...{ navigate, route, params, isLast: true, ...item }} />  </div>}
            </For>
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
