import Page from "@/src/Utils/Shared/Page";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import { createEffect, For, Match, Show, Switch } from "solid-js";
import useFeed from "@/src/Utils/Hooks/useFeed";
import { api } from "@/src";
import Post from "@/src/components/PostRelated/Post"; 
import Bookmark from "@/src/components/Icons/Bookmark"; 
export default function () {
    const { params, route, navigate } = useNavigation("/bookmarks");
    const { posts, loading, setPosts } = useFeed("posts", { filter: `bookmarked ~"${api.authStore.model.id}"`, limit: 10, _for: "bookmarks" })
    createEffect(() => {
        console.log(posts().length)
        //@ts-ignore
        window.removeFromBookMarks = (id) => {
            setPosts(posts().filter((p) => p.id !== id))
        }
    })
    return (
        <Page id={crypto.randomUUID()} {...{ params, route, navigate }}>
            <div class="p-5">
                <h1 class="text-lg font-bold">Bookmarks</h1>
            </div>

            <Switch>
                <Match when={loading()}>
                    <span class="loading flex mx-auto justify-center mt-12 loading-spinner loading-xl"></span>
                </Match>
                <Match when={posts() && posts().length < 1 && !loading() }>
                    <div class="flex justify-center mx-auto">
                    <h1>When you start book marking posts they will appear here!</h1>
                </div>
                </Match>
                <Match when={posts()  && posts().length >= 1  && !loading() }>
 <For each={posts()}>
                    {(p) => {
                        return <Post {...p} />
                    }}
                </For>
                </Match>
            </Switch>
             
        </Page>
    )
}