import { api } from "..";
import HomeNav from "../components/Navbars/HomeNav";
import Page from "../Utils/Shared/Page";
import useNavigation from "../Utils/Hooks/useNavigation";
import { createEffect, createSignal, ErrorBoundary, For, Match, Switch, onMount } from "solid-js";
import useFeed from "../Utils/Hooks/useFeed";
import Post from "../components/PostRelated/Post";
import LoadingIndicator from "../components/Icons/loading";
import { joinClass } from "../Utils/Joinclass";
export default  function Home() {
  const { route, params, navigate } = useNavigation("/");
  const { feed, currentPage, setFeed, posts, loading, reset} = useFeed("posts", { filter: `author.id !="${api.authStore.model.id}" && author.deactivated=false`, _for: "home" });

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
      <ErrorBoundary
        fallback={
          (err, reset) => <div class="flex flex-col justify-center text-center mt-5 gap-5">
            <h1 class="text-3xl">Something went wrong</h1>
            <p>
              {err.message}
            </p>
            <button onClick={() => setFeed("home")} class="bg-blue-500 text-white p-2 rounded-md">Reload</button>
          </div>

        }
      >
        <Switch>
          <Match when={!loading()}>
            <div class="flex flex-col   ">
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
      </ErrorBoundary>
    </Page>
  );
}
