import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { onCleanup } from "solid-js";

// Inside your Post component, where you render the video CarouselItem
// We'll define a helper component VideoWithCleanup to encapsulate the fix:

function VideoWithCleanup(props: { src: string, class: string }) {
  let videoRef: HTMLVideoElement | undefined;

  onCleanup(() => {
    if (videoRef) {
      videoRef.pause();
      videoRef.removeAttribute("src"); // Important: remove src to free resource
      videoRef.load();                // Reset video element state
    }
  });

  return (
    <video
      ref={el => (videoRef = el)}
      class={props.class}
      src={props.src}
      controls
      playsinline
      muted={false} // user controls sound, so muted false here
    />
  );
}
import { api } from "@/src";
import usePost from "@/src/Utils/Hooks/usePost";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import { For, Match, Show, Switch, createSignal, createEffect, onMount } from "solid-js";
import Heart from "../Icons/heart";
import Dropdown, { DropdownHeader, DropdownItem } from "../UI/UX/dropdown";
import Carousel, { CarouselItem } from "../UI/UX/Carousel";
import StringJoin from "@/src/Utils/StringJoin";
import { A } from "@solidjs/router";
import Verified from "../Icons/Verified";
import Bookmark from "../Icons/Bookmark";
import Share from "../Icons/Share";
import { dispatchAlert, haptic } from "@/src/Utils/SDK";
import useCache from "@/src/Utils/Hooks/useCache";
import BlockUserModal from "../Modals/BlockedModal";
import { GeneralTypes } from "@/src/Utils/SDK/Types/GeneralTypes";
import DeletePostModal from "../Modals/DeletePostModal";
const created = (created: any) => {
  let date = new Date(created);
  let now = new Date();
  let diff = now.getTime() - date.getTime();
  let seconds = diff / 1000;
  let minutes = seconds / 60;
  let hours = minutes / 60;
  let days = hours / 24;
  let weeks = days / 7;
  let months = weeks / 4;
  let years = months / 12;
  switch (true) {
    case seconds < 60:
      return `${Math.floor(seconds)}s`;
      break;
    case minutes < 60:
      return `${Math.floor(minutes)}m`;
      break;
    case hours < 24:
      return `${Math.floor(hours)}h`;
      break;
    case days < 7:
      return `${Math.floor(days)}d`;
      break;
    case weeks < 4:
      return `${Math.floor(weeks)}w`;
      break;
    case months < 12:
      return `${Math.floor(months)}mo`;
      break;
    case years > 1:
      return `${Math.floor(years)}y`;
      break;
    default:
      break;
  }
};
type Props = {
  author?: string | any;
  id?: string | any;
  content?: string;
  created?: Date;
  updated?: Date;
  expand?: { [key: string]: any } | any;
  comments?: string[];
  file?: string[];
  isRepost?: boolean;
  disabled?: boolean;
  isComment?: boolean;
  [key: string]: any;
  isLast: boolean;
};

function getFileType(file: string) {
  switch (true) {
    case file.endsWith(".png"):
    case file.endsWith(".gif"):
    case file.endsWith(".webp"):
    case file.endsWith(".jpeg"):
    case file.endsWith(".jpg"):
    case file.endsWith(".svg"):
    case file.endsWith(".avif"):
      return "image"
    case file.endsWith(".mp4"):
      return "video"
  }
}

export default function Post(props: Props) {
  console.log(props.comments?.length, props.expand)
  let { theme } = useTheme();
  let [likes, setLikes] = createSignal<any[]>(props.likes || [], { equals: false });
  let [bookmarks, setBookmarks] = createSignal(props.bookmarked || [])
  let [comments, setComments] = createSignal<any[]>([]);
  let [commentLength, setCommentLength] = createSignal(
    props?.comments?.length || 0, { equals: false }
  );
  let [pinned, setPinned] = createSignal(props?.pinned === true, { equals: false })

  console.log(pinned(), props.pinned)
  let [views, setViews] = createSignal<any[]>(props.views || []);


  let [totalVotes, setTotalVotes] = createSignal(0);
  let [pollOptions, setPollOptions] = createSignal([]);
  let [pollEnds, setPollEnds] = createSignal(new Date());
  const [loadedMeta, setLoadedMeta] = createSignal(false)
  const [_preview_meta, set_preview_meta] = createSignal(null)

  createEffect(() => {
    const url = props.embedded_link;

    // Avoid refetching if the link hasn't changed
    if (!url) return;



    fetch(`${api.serverURL}/opengraph/embed?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((meta) => {
        console.log(meta)
        set_preview_meta(meta)
        setLoadedMeta(true)
      })
      .catch(() => {
        set_preview_meta(null)
        setLoadedMeta(false)
      });
  });





  function calculatePollEnds(ends: Date) {
    const date = new Date(ends);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) {
      return "Ended";
    }


    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44); // Average days in a month
    const years = Math.floor(days / 365.25); // Average days in a year

    if (seconds < 60) {
      return `${seconds}s`;
    } else if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days < 7) {
      return `${days}d`;
    } else if (weeks < 4) {
      return `${weeks}w`;
    } else if (months < 12) {
      return `${months}mo`;
    } else {
      return `${years}y`;
    }
  }

  async function updatePoll() {

  }

  async function deletePost() {
    document.getElementById("delete-post-modal")?.showModal();
  }

  async function Pin() {
    const topin = !pinned();
    setPinned(topin);
    try {
      if (typeof props.setPosts === "function") {
        props.setPosts((prev: any[]) => {
          // Update pinned state in the list
          const updated = prev.map(post =>
            post.id === props.id ? { ...post, pinned: pinned() } : post
          );

          // Sort: pinned at top, then by created date descending
          return updated.sort((a, b) => {
            // Pinned first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            // Then newest first
            return new Date(b.created).getTime() - new Date(a.created).getTime();
          });
        });
      }
      const { res } = await api.send(`/actions/posts/${topin ? "pin" : "unpin"}`, {
        body: { targetId: props.id }
      });
      // Optionally use backend truth
      if (res && "pinned" in res) {
        setPinned(res.pinned);
      }
      console.log(props.setPosts)


      api.updateCache("posts", props.id, { pinned: pinned() });
      dispatchAlert({
        type: "success",
        message: topin ? "Post pinned!" : "Post unpinned!"
      });
    } catch (err) {
      if (typeof props.setPosts === "function") {
        props.setPosts((prev: any[]) => {
          // Update pinned state in the list
          const updated = prev.map(post =>
            post.id === props.id ? { ...post, pinned: pinned() } : post
          );

          // Sort: pinned at top, then by created date descending
          return updated.sort((a, b) => {
            // Pinned first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            // Then newest first
            return new Date(b.created).getTime() - new Date(a.created).getTime();
          });
        });
      }
      dispatchAlert({
        type: "error",
        message: "Failed to pin/unpin post."
      });
    }
  }

  async function updateLikes(userId: string, isComment: boolean = false) {
    const currentLikes = likes();
    const hasLiked = currentLikes.includes(userId);
    const action = hasLiked ? "unlike" : "like";
    const collection = isComment ? "comments" : "posts";
    if (!api.authStore.model.username) {
      haptic.error()
      return;
    }

    if (action === "like") {
      setLikes([...likes(), userId]);
      api.metrics.trackUserMetric("posts_liked", props.id)
      api.metrics.uploadUserMetrics()
      haptic()
      api.worker.ws.send({
        payload: {
          type: GeneralTypes.NOTIFY,
          notification_data: {
            author: api.authStore.model.id,
            ...(props.isComment ? { comment: props.id } : { post: props.id }),
            recipients: [props.author],
            url: `${window.location.host}/notifications`,
            notification_title: `${api.authStore.model.username} Just liked your post 🥳`,
            notification_body: props.content,
            message: props.content,
            icon: `${api.authStore.model.avatar ? api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar || "") : "/icons/usernotfound/image.png"}`,
            image: `${api.cdn.getUrl("posts", props.id, props.files[0])}`
          }
        },
        security: {
          token: api.authStore.model.token
        }
      })

    } else {
      setLikes(hasLiked
        ? currentLikes.filter(id => id !== userId)
        : [...currentLikes, userId]
      );
      haptic()
    }

    try {
      const { res } = await api.send(`/actions/${collection}/${action}`, {
        body: { targetId: props.id }
      });

      // Assuming res.likes is the updated likes array from backend
      if (res && Array.isArray(res.likes)) {
        api.updateCache(isComment ? "comments" : "posts", props.id, {
          likes: likes(),
        })
      } else {
        // fallback in case res.likes not returned
        setLikes(hasLiked
          ? currentLikes.filter(id => id !== userId)
          : [...currentLikes, userId]
        );
        api.updateCache(isComment ? "comments" : "posts", props.id, {
          likes: likes(),
        })
      }


    } catch (error) {
      dispatchAlert({
        type: "error",
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }



  async function bookMarkPost() {
    if (!api.authStore.model.id) {
      haptic.error();
      return;
    }

    const userId = api.authStore.model.id;

    if (bookmarks().includes(userId)) {
      //@ts-ignore
      if (window.removeFromBookMarks) {
        //@ts-ignore
        window.removeFromBookMarks(props.id);
      }
      dispatchAlert({
        type: "success",
        message: "Post removed from Bookmarks"
      });
      haptic();

      const newBookmarks = bookmarks().filter((c) => c !== userId);
      setBookmarks(newBookmarks);

      api.resetCache(`posts_bookmarks_feed_${api.authStore.model.id}`)


    } else {
      const newBookmarks = [...bookmarks(), userId];
      setBookmarks(newBookmarks);
      api.metrics.trackUserMetric("posts_bookmarked", props.id);
      dispatchAlert({
        type: "info",
        message: "Added Post To Bookmarks",
        link: "/bookmarks"
      });

      api.resetCache(`posts_bookmarks_feed_${api.authStore.model.id}`)
      haptic();
    }

    try {
      const { res } = await api.send("/actions/posts/bookmark", {
        body: { targetId: props.id }
      });

      if (res && res.bookmarked) {
        setBookmarks(res.bookmarked);
        api.updateCache("posts", props.id, {
          bookmarked: res.bookmarked
        });
      }

    } catch (error) {
      dispatchAlert({
        type: "error",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }



  onMount(() => {
    const handler = (event: MessageEvent) => {

      let parsed;
      try {
        parsed = JSON.parse(event.data.data);
      } catch (e) {
        console.log(e)
        return;
      }
      const data = parsed?.data;
      if (!data) return;
      if (data.action && (data.action === "like" || data.action === "unlike") && data.targetId === props.id) {
        const current = likes();
        if (data.action === "like" && !current.includes(data.res.author)) {
          setLikes([...current, data.res.author]);
        }
        if (data.action === "unlike") {
          setLikes(current.filter(id => id !== data.res.author));
        }
      }
    };


    api.worker.ws.addEventListener(handler)

    onCleanup(() => {
      if (api.ws) {
        api.worker.ws.removeEventListener(handler)
      }
    });
  });


  return (
    <Card
      class={joinClass(

        props.wasReposted ? "border border-slate-200 rounded-xl" : "",
        theme() === "dark" && !props.page ? "hover:bg-[#121212]" : theme() === "light" && !props.page ? "hover:bg-[#faf9f9]" : "",
        " h-fit z-10",
        "p-2 text-md shadow-none ",

        props.disabled
          ? "rounded "
          : `   rounded-none shadow-none${theme() === "dark" && !props.page ? "hover:bg-[#121212]" : theme() === "light" && !props.page ? "hover:bg-[#faf9f9]" : ""
          }`
      )}
    >
      <Show when={pinned() && window.location.pathname.includes("/u")}>
        <div class="flex hero   gap-5  "><svg viewBox="0 0 24 24" aria-hidden="true" class={
          joinClass(
            "w-4 h-4",
            theme() == "dark" ? "text-white fill-white" : "text-black"
          )
        }><g><path d="M7 4.5C7 3.12 8.12 2 9.5 2h5C15.88 2 17 3.12 17 4.5v5.26L20.12 16H13v5l-1 2-1-2v-5H3.88L7 9.76V4.5z"></path></g></svg>Pinned</div>
      </Show>
      <CardHeader class="flex p-[0.3rem]   mt-2 flex-row gap-3  relative ">

        <Switch fallback={<></>}>
          <Match when={!props.expand?.author.avatar}>
            <img
              src="/icons/usernotfound/image.png"
              alt={props.author}
              class="w-10 h-10 rounded object-cover"
            />
          </Match>

          <Match when={props.expand.author.avatar}>
            <img
              src={api.cdn.getUrl(
                "users",
                props.author,
                props.expand.author.avatar
              )}
              alt={props.author}
              class="w-10 h-10 rounded object-cover"
            />
          </Match>
        </Switch>


        <div class="flex gap-2   items-start mt-0 mb-5 pt-0">
          <div class="flex hero items-center mt-0   pt-0">
            <CardTitle
              class="cursor-pointer flex items-center gap-1"
              onClick={() => props.navigate(StringJoin("/u/", props.expand.author.username))}
            >
              {props.expand && props.expand.author.username}
            </CardTitle>
            <Show when={props.expand.author.validVerified}>
              <div data-tip="Verified" class="tooltip flex items-center">
                <Verified class="w-5 h-5 mx-1 text-blue-500 fill-blue-500 " />
              </div>
            </Show>
            <Show when={props.expand.author.isEarlyUser}>
              <div data-tip="Early Access Member" class="tooltip tooltip-top mx-2 flex items-center">
                <img src="/icons/legacy/postr.png" class="w-[17.5px] h-[17.5px]" />
              </div>
            </Show>
          </div>
          <CardTitle class="text-sm opacity-50 flex items-center">·</CardTitle>
          <CardTitle class="text-sm opacity-50 flex items-center">{created(props.created)}</CardTitle>
        </div>


        <Show when={!props.isComment && !window.location.pathname.includes("/view") || props.isComment && window.location.pathname.includes("/view")}>
          <CardTitle class="absolute   right-0">
            <div class="dropdown dropdown-left    ">
              <div tabindex="0" role="button" class="btn z-[10] btn-ghost btn-sm m-1" onClick={() => {
                if (!api.authStore.model.username) {
                  requireSignup()
                  return;
                }
              }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </div>
              <ul
                tabindex="0"
                class="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow z-[99999]"
              >
                <li>
                  <a>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                      />
                    </svg>
                    Embed Post
                  </a>
                </li>
                <Show when={props.expand.author.id === api.authStore.model.id}>
                  <li>
                    <a onClick={Pin}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4 text-black"><g><path d="M7 4.5C7 3.12 8.12 2 9.5 2h5C15.88 2 17 3.12 17 4.5v5.26L20.12 16H13v5l-1 2-1-2v-5H3.88L7 9.76V4.5z"></path></g></svg>
                      {pinned() ? "Unpin Post" : "Pin Post"}
                    </a>
                  </li>
                </Show>
                <Show when={props.expand.author.id === api.authStore.model.id && window.location.pathname.includes("/u")}>
                  <li>
                    <a onClick={deletePost}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>

                      Delete Post
                    </a>
                  </li>
                </Show>
                <li>
                  <a>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      class="w-4 h-4"
                    >
                      <g>
                        <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                      </g>
                    </svg>
                    View  Engagement
                  </a>
                </li>
                <Show when={props.expand.author.id !== api.authStore.model.id}>
                  <li >
                    <a>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                        />
                      </svg>
                      Report @{props.expand.author.username}
                    </a>
                  </li>
                  <li onClick={() => {
                    window.dispatchEvent(new CustomEvent("block-user", {
                      detail: {
                        user: props.expand.author,
                        setPosts: props.setPosts
                      }
                    }))
                  }}>
                    <a

                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                      Block @{props.expand.author.username}
                    </a>
                  </li>
                </Show>
              </ul>
            </div>
          </CardTitle>

        </Show>
      </CardHeader>
      <CardContent class="p-1 cursor-pointer">

        <a onClick={() => props.navigate(StringJoin("/view/", props.isComment ? "comments/" : "posts/", props.id))}>
          <p class="text-md whitespace-pre-wrap">{props.content}</p>

        </a>
      </CardContent>

      <Switch>
        <Match when={props.embedded_link && !loadedMeta()}>

          <span className="loading loading-spinner loading-2xl flex mx-auto justify-center text-blue-500 mb-5"></span>
        </Match>
        <Match when={props.embedded_link && loadedMeta()}>
          <Show when={_preview_meta().image}>

            <a
              href={props.embedded_link}
              target="_blank"
              rel="noopener noreferrer"
              class="block w-full h-[20rem] mt-5 relative rounded-xl overflow-hidden border"
            >
              <img
                src={_preview_meta().image || '/placeholder.png'}
                class="w-full h-full aspect-[16/9] object-fit"
                alt="Link preview"
              />
              <div class="absolute bottom-0 bg-black bg-opacity-60 text-white p-2 text-sm w-full">
                {_preview_meta().title || "Untitled"}
              </div>
            </a>
          </Show>
        </Match>
      </Switch>
      <Show when={props.files && props.files.length > 0}>

        <CardContent class="p-1   ">

          <Carousel >
            <For each={props.files} fallback={<></>}>
              {(item) => (
                console.log(item, props.id),
                <CarouselItem

                >
                  <Switch>
                    <Match when={getFileType(item) == "image"}>
                      <img
                        onClick={() => {
                          window.open(api.cdn.getUrl(props.isComment ? "comments" : "posts", props.id, item), "_blank");
                        }}
                        src={api.cdn.getUrl(props.isComment ? "comments" : "posts", props.id, item)}
                        class={joinClass(
                          "w-full   aspect-[16/9]  object-fill rounded-xl",
                          "cursor-pointer",
                          theme() === "dark"
                            ? "border-[#121212] border"
                            : "border-[#cacaca] border"
                        )}
                      />
                    </Match>
                    <Match when={getFileType(item) == "video"}> <VideoWithCleanup
                      src={api.cdn.getUrl(props.isComment ? "comments" : "posts", props.id, item)}
                      class={joinClass(
                        "w-full   aspect-[16/9]  object-fill  rounded-xl cursor-pointer",
                        theme() === "dark" ? "border-[#121212] border" : "border-[#cacaca] border"
                      )}
                    />
                    </Match>
                  </Switch>
                </CarouselItem>
              )}
            </For>
          </Carousel>
        </CardContent>
      </Show>


      {/**
       * @search - repost section
       */}
      <CardContent class="p-1">

        <Show when={props.isRepost}>
          <Post
            author={props.expand.repost.author}
            id={props.expand.repost.id}
            content={props.expand.repost.content}
            disabled={true}
            created={props.expand.repost.created}
            updated={props.expand.repost.updated}
            expand={props.expand.repost.expand}
            comments={props.expand.repost.comments}
            files={props.expand.repost.files}
            isLast={false}
            wasReposted={true}
            navigate={props.navigate}
          />
        </Show>
      </CardContent>

      {/**
       * @search - footer section
       */}
      <Show when={!props.disabled}>
        <CardFooter class="p-1 flex gap-3 relative items-start">
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              onClick={() => {
                if (!api.authStore.model.id) {
                  // assume they have a basic access token
                  requireSignup();
                } else {
                  updateLikes(api.authStore.model.id, props.isComment)
                }
              }}
              class={joinClass(
                "w-6 h- cursor-pointer",
                likes().includes(api.authStore.model.id)
                  ? "fill-red-500 stroke-red-500"
                  : ""
              )}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
            <span class="countdown" data-likes={likes().length}>
              <span style={{ "--value": Math.abs(likes().length), "transition": "all 0.2s" }}>
                {likes().length}
              </span>
            </span>

          </div>
          <div class="flex items-center gap-2 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6 cursor-pointer"
              onClick={() => props.navigate(StringJoin("/view/", "posts/", props.id))}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              />
            </svg>
            <span class="countdown">  <span style={{ "--value": Math.abs(props.comments ? props.comments.length : props.commentCount || commentLength()) }}></span></span>

          </div>
          <Show when={!props.hidden || !props.hidden.includes("repostButton")}>
            <div class=" flex items-center gap-2 "
              onClick={() => {
                if (api.authStore.model.id) {
                  //@ts-ignore
                  window.repost(props)
                  document.getElementById("createPostModal")?.showModal()
                } else {
                  //@ts-ignore
                  requireSignup()
                }
              }}
            ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="   hover:rounded-full hover:bg-green-400 hover:bg-opacity-20   hover:text-green-600 cursor-pointer  w-6 h-6 size-6 "><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"></path></svg></div>
          </Show>
          <div class="flex hero gap-2">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              class={joinClass(
                "cursor-pointer hover:rounded-full hover:bg-sky-500 hover:bg-opacity-20  size-6 hover:p-2 hover:text-sky-500 ",
                theme() === "dark" ? "fill-white" : "fill-black"
              )}
            >
              <g>
                <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
              </g>
            </svg>
            {props.views && props.views.length || 0}
          </div>

          <div class="flex absolute right-5 gap-5">
            <Bookmark class={
              joinClass("w-6 cursor-pointer h-6", bookmarks().includes(api.authStore.model.id) && "fill-blue-500 stroke-blue-500")

            } onClick={() => bookMarkPost()} />
            <div class=" hover:cursor-pointer" onClick={() => {
              const shareData = {
                title: `Postly - Post by ${props.expand.author.username}`,
                text: props.content,
                url: `https://postlyapp.com/view/posts/${props.id}`,
              };
              navigator.share(shareData)
            }} >

              <Share class="w-6 h-6 " />
            </div>
          </div>
        </CardFooter>
      </Show>
      <DeletePostModal id={props.id} setPosts={props?.setPosts || null} />
    </Card>
  );
}
