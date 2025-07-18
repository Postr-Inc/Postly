import { api } from "..";
import HomeNav from "../components/Navbars/HomeNav";
import Page from "../Utils/Shared/Page";
import useNavigation from "../Utils/Hooks/useNavigation";
import { createEffect, createSignal, ErrorBoundary, For, Match, Switch, onMount, Show } from "solid-js";
import useFeed from "../Utils/Hooks/useFeed";
import Post from "../components/PostRelated/Post";
import LoadingIndicator from "../components/Icons/loading";
import { joinClass } from "../Utils/Joinclass";
import useDevice from "../Utils/Hooks/useDevice";
export default function Home() {
  const { route, params, navigate } = useNavigation("/");
  const { feed, currentPage, setFeed, posts, loading, reset, setPosts } = useFeed("posts", { filter: `author.id !="${api.authStore.model.id}" && author.deactivated=false`, _for: "home" });

  const { mobile } = useDevice()
  console.log(mobile())
  const [newPostAppended, setNewPostAppended] = createSignal(false);
  const [recentPosts, setRecentPosts] = createSignal<any[]>([]);
  onMount(() => {
    createEffect(() => {
      window.onbeforeunload = function () {
        window.scrollTo(0, 0);
      }
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY < 100) {
        setNewPostAppended(false);
        setRecentPosts([]);
      }
    });
    api.ws?.addEventListener("message", (event) => {
      // listen for new posts
      const { data } = JSON.parse(event.data);
      if (data.action === "create" && data.collection === "posts" && data.res.author != api.authStore.model.id) {
        console.log("New post received:", data.res);
        setNewPostAppended(true); 
        setPosts((prevPosts) => [data.res, ...prevPosts]);
        setRecentPosts((prevPosts) => { 
          if (prevPosts.length >= 5) {
            return [data.res, ...prevPosts.slice(0, 4)];
          }
          return [data.res, ...prevPosts];
        }
        );

        setTimeout(() => {
          setNewPostAppended(false);
          setRecentPosts([]);
        }, 5000);

        api.updateCache("posts", data.res.id, data.res, data.res, "add") 
      }
    })

  })

  return (
    <Page {...{ navigate, params, route: route }} id={feed()}>
      <HomeNav navigate={navigate} page={feed} swapFeed={setFeed} />
      <Show when={newPostAppended() && window.scrollY > 100}>
        <div
          class="fixed top-[170px] left-1/2 -translate-x-1/2 z-20"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setNewPostAppended(false);
            setRecentPosts([]);
          }}
        >
          <div class="flex items-center dark:bg-gray-800 bg-white dark:text-white text-black rounded-full shadow-lg p-3 cursor-pointer transition-all duration-300 hover:scale-105">
            <div class="avatar-group -space-x-4 mr-3">
              <For each={recentPosts()}>
                {(item) => (
                  <div class="avatar">
                    <div class="w-8 border-2 border-white rounded-full overflow-hidden">
                      <img src={api.cdn.getUrl("users", item.author, item.expand.author.avatar)} alt="New Post" />
                      
                    </div>
                  </div>
                )}
              </For>
              <span class="text-sm font-semibold">
                {recentPosts().length} new post{recentPosts().length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </Show>

      <Switch>
        <Match when={!loading()}>
          <div class="flex flex-col     ">


            <Show when={posts()}>
              <For each={posts()}>
                {(item, index) => <div  style={{"margin-bottom": index() == posts().length - 1  && mobile() ? "10rem" : ""}}>   <Post {...{ navigate, route, params, isLast: true, ...item, id: item.id }} />  </div>}
              </For>
            </Show>
            
            <Show when={posts().length < 1 }>
              <div class="text-center text-gray-500 dark:text-gray-400 mt-10">
                No {feed().includes("topic") ? feed().split("topic-")[1] : feed()} posts available at the moment.
              </div>
            </Show>
          </div>
        </Match>
        <Match when={loading()}>
          <For each={Array.from({ length: 10 })}>
            {() => <div  ><LoadingIndicator /></div>}
          </For>
        </Match>
      </Switch>
    </Page>
  );
}
