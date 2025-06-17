//@ts-nocheck
import { api } from "@/src";
import ArrowLeft from "@/src/components/Icons/ArrowLeft";
import LoadingIndicator from "@/src/components/Icons/loading";
import Media from "@/src/components/Icons/Media";
import Post from "@/src/components/PostRelated/Post";
import useDevice from "@/src/Utils/Hooks/useDevice";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import Page from "@/src/Utils/Shared/Page";
import { Index } from "solid-js"


import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, onMount, Show, Switch, For } from "solid-js";
import Carousel, { CarouselItem } from "@/src/components/UI/UX/Carousel";
import Ellipse from "@/src/components/Icons/Ellipse";
export default function View(props: any) {
  var { route, params, searchParams, navigate, goBack } = useNavigation(
    "/view/:collection/:id"
  );
  let { id, collection } = useParams();
  const [isReplying, setIsReplying] = createSignal(false);
  let [post, setPost] = createSignal<any>(null, {equals: false});
  let [comments, setComments] = createSignal<any[]>([]);
  let [loading, setLoading] = createSignal(true)

  let [comment, setComment] = createSignal<any>({
    content: "",
    media: [],
    likes: [],
    author: api.authStore.model.id,
    ...(collection === "comments" ? { mainComment: id } : { post: id }),
  });

  let [files, setFiles] = createSignal<any>([]);

  // Ensure auth check on every render
  if (!api.authStore.isValid()) navigate("/auth/login", null);

  let { mobile, desktop, tablet } = useDevice();

  async function createComment() {
    let data = comment();
    Object.assign(post().expand, { comments: post().expand.comments || [] });

    // turn files into buffers
    if (files().length > 0) {
      let filesData = files().map((file: any) => {
        let fileObj = {
          name: file.name,
          type: file.type,
          size: file.size,
        }
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            resolve({ data: Array.from(new Uint8Array(reader.result as ArrayBuffer)), ...fileObj });
          };
        });
      });
      filesData = await Promise.all(filesData);
      data.files = filesData;
    }

    api.collection("comments").create(data, {
      expand: ["author"],
      invalidateCache: [`${collection}-${id}-comments`],
    }).then((data: any) => {
      let author = api.authStore.model;
      delete author.token
      delete author.email;
      Object.assign(data, { expand: { author: api.authStore.model } });
      if (post().expand.comments) {
        post().expand.comments.push(data);
      }
      post().comments.push(data?.id);
      if (!post().expand.comments.find((c: any) => c.id === data.id)) {
        post().expand.comments.push(data);
      }
      let Updatedata = {
        comments: post().comments,
        expand: {
          comments: post().expand.comments,
          ...post().expand
        }
      }

      setPost({
        ...Updatedata,
        ...post(),
      });
      setFiles([]);
      setComments([data, ...comments()]);
      setComment({ content: "", media: [], author: api.authStore.model.id, post: null });
      api.collection(collection === "comments" ? "comments" : "posts").update(post().id, Updatedata).then((data) => {
        setPost(data);
      });
    })
  }

  function fetchP() {
    let { params } = useNavigation("/view/:collection/:id");
    let { id, collection } = params();
    api
      .collection(collection)
      .get(id, {
        cacheKey: `post-${id}`,
        expand: [
          "comments",
          "comments.likes",
          "comments.author",
          "author",
          "author.followers",
          "likes",
          "repost",
          "repost.likes",
          "repost.author",
        ],
      })
      .then((data) => {
        setPost(data);
        window.setWhoCanReply(
          data.whoCanSee && data.whoCanSee.length > 0 ? data.whoCanSee[0] : []
        )
        window.setMainPost(data)
        setTimeout(()=>{
          setLoading(false)
        }, 2000)
      })
      .catch((err) => {
        console.log(err);
      });


    api.collection("comments").list(1, 10, {
      filter: collection === "comments" ? `mainComment="${id}"` : `post="${id}"`,
      expand: ["author", "likes", "comments"],
      cacheKey: `${collection}-${id}-comments`,
      "sort": "-created"
    }).then((data) => {
      console.log(data);
      setComments(data.items);
    });
  }

  // CreateEffect to trigger refetching when the `id` changes
  onMount(() => {
    
    createEffect(() => {
      api.checkAuth();

      window.addEventListener("popstate", ()=>{
        setPost(null)
        setLoading(true)
      });
      window.addEventListener("commentCreated", (e) => {
        let commentData = e.detail;
        console.log("Comment created event received:", commentData);
        if (commentData.post === id || (collection === "comments" && commentData.mainComment === id)) {
          setComments([commentData, ...comments()]);

        }
      });
      fetchP(); 
    }); // Depend on the `id` parameter

  
  })

  

  let { theme } = useTheme();


  return (
    <Page {...{ params: useParams, route, navigate: props.navigate }} id={id}>
      <div class={joinClass("flex flex-col w-full h-full  ", theme() === "dark" && desktop() ? "border border-[#1c1c1c]" : "")}>
        <div class="flex flex-row justify-between gap-5 p-3">
          <ArrowLeft class="w-6 h-6 cursor-pointer" onClick={() => goBack()} stroke-width="2" />
          <h1 class="font-bold">Post</h1>
          <Ellipse />
        </div>
        <div class="flex flex-col">
          <Switch fallback={<div>Something went wrong</div>}>
            <Match when={loading()}>
              <LoadingIndicator />
            </Match>
            <Match when={post() !== null}>
              <Post {...{ ...post(), page: route(), navigate, isComment: collection === "comments" }} />
            </Match>
          </Switch>
        </div>
        <Show when={post() && post().author === api.authStore.model.id}>
          <div class="flex flex-row gap-5 p-5 mt-2 ">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              class={joinClass(
                "cursor-pointer hover:rounded-full hover:bg-sky-500 hover:bg-opacity-20 size-6 hover:p-2 hover:text-sky-500",
                theme() === "dark" ? "fill-white" : "fill-black"
              )}
            >
              <g>
                <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
              </g>
            </svg>
            View Post Engagements
          </div>
        </Show>
        <div>
          <Switch>
            <Match when={post() && !loading() && comments().length > 0}>
              <For each={comments()}>
                {(comment, index) => (
                  <div style={{ "margin-bottom": index() === comments().length - 1 ? "100px" : "0px" }} class="border-l-0 border-r-0  relative">
                    <Post
                      {...{
                        ...comment,
                        page: route(),
                        navigate,
                        isComment: true,
                        postId: id,
                        isReply: collection === "comments",
                        replyTo: post().expand.author.id,
                      }}
                    />
                  </div>
                )}
              </For>
            </Match>
            <Match when={post() && !loading() && comments().length < 1}>
              <div class="p-5 text-xl text-center">
                ✨ Nobody has commented, be the first to comment
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </Page>
  );
}
