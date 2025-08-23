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

function VideoWithCleanup(props: { src: string; class: string }) {
  let videoRef: HTMLVideoElement | undefined;

  onCleanup(() => {
    if (videoRef) {
      videoRef.pause();
      videoRef.removeAttribute("src"); // Important: remove src to free resource
      videoRef.load(); // Reset video element state
    }
  });

  return (
    <video
      ref={(el) => (videoRef = el)}
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
import {
  For,
  Match,
  Show,
  Switch,
  createSignal,
  createEffect,
  onMount,
} from "solid-js";
import Heart from "../../Icons/heart";
import Dropdown, {
  DropdownHeader,
  DropdownItem,
} from "@/components/UX/dropdown";
import Carousel, { CarouselItem } from "@/components/UX/Carousel";
import StringJoin from "@/src/Utils/StringJoin";
import { A } from "@solidjs/router";
import Verified from "../../Icons/Verified";
import Bookmark from "../../Icons/Bookmark";
import Share from "../../Icons/Share";
import { dispatchAlert, haptic } from "@/src/Utils/SDK";
import useCache from "@/src/Utils/Hooks/useCache";
import BlockUserModal from "../Modal/BlockedModal";
import { GeneralTypes } from "@/src/Utils/SDK/Types/GeneralTypes";
import DeletePostModal from "../Modal/DeletePostModal";
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
      return "image";
    case file.endsWith(".mp4"):
      return "video";
  }
}

export default function Post(props: Props) {
  console.log(props.comments?.length, props.expand);
  let { theme } = useTheme();
  let [likes, setLikes] = createSignal<any[]>(props.likes || [], {
    equals: false,
  });
  let [bookmarks, setBookmarks] = createSignal(props.bookmarked || []);
  let [comments, setComments] = createSignal<any[]>([]);
  let [commentLength, setCommentLength] = createSignal(
    props?.comments?.length || 0,
    { equals: false },
  );
  let [pinned, setPinned] = createSignal(props?.pinned === true, {
    equals: false,
  });

  console.log(pinned(), props.pinned);
  let [views, setViews] = createSignal<any[]>(props.views || []);

  let [totalVotes, setTotalVotes] = createSignal(0);
  let [pollOptions, setPollOptions] = createSignal([]);
  let [pollEnds, setPollEnds] = createSignal(new Date());
  const [loadedMeta, setLoadedMeta] = createSignal(false);
  const [_preview_meta, set_preview_meta] = createSignal(null);

  createEffect(() => {
    const url = props.embedded_link;

    // Avoid refetching if the link hasn't changed
    if (!url) return;

    fetch(`${api.serverURL}/opengraph/embed?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((meta) => {
        console.log(meta);
        set_preview_meta(meta);
        setLoadedMeta(true);
      })
      .catch(() => {
        set_preview_meta(null);
        setLoadedMeta(false);
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

  async function updatePoll() {}

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
          const updated = prev.map((post) =>
            post.id === props.id ? { ...post, pinned: pinned() } : post,
          );

          // Sort: pinned at top, then by created date descending
          return updated.sort((a, b) => {
            // Pinned first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            // Then newest first
            return (
              new Date(b.created).getTime() - new Date(a.created).getTime()
            );
          });
        });
      }
      const { res } = await api.send(
        `/actions/posts/${topin ? "pin" : "unpin"}`,
        {
          body: { targetId: props.id },
        },
      );
      // Optionally use backend truth
      if (res && "pinned" in res) {
        setPinned(res.pinned);
      }
      console.log(props.setPosts);

      api.updateCache("posts", props.id, { pinned: pinned() });
      dispatchAlert({
        type: "success",
        message: topin ? "Post pinned!" : "Post unpinned!",
      });
    } catch (err) {
      if (typeof props.setPosts === "function") {
        props.setPosts((prev: any[]) => {
          // Update pinned state in the list
          const updated = prev.map((post) =>
            post.id === props.id ? { ...post, pinned: pinned() } : post,
          );

          // Sort: pinned at top, then by created date descending
          return updated.sort((a, b) => {
            // Pinned first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            // Then newest first
            return (
              new Date(b.created).getTime() - new Date(a.created).getTime()
            );
          });
        });
      }
      dispatchAlert({
        type: "error",
        message: "Failed to pin/unpin post.",
      });
    }
  }

  async function updateLikes(userId: string, isComment: boolean = false) {
    if (!api.authStore.model.username) {
      //@ts-ignore
      requireSignup();
      return;
    }

    // 1. Capture the original state for potential rollback on error
    const originalLikes = likes();
    const hasLiked = originalLikes.includes(userId);
    const action = hasLiked ? "unlike" : "like";
    const collection = isComment ? "comments" : "posts";

    // 2. Perform the optimistic UI update immediately
    const newLikes = hasLiked
      ? originalLikes.filter((id) => id !== userId)
      : [...originalLikes, userId];

    setLikes(newLikes);
    haptic();

    // Handle side-effects (notifications, metrics) optimistically
    if (action === "like") {
      api.metrics.trackUserMetric("posts_liked", props.id);
      api.metrics.uploadUserMetrics();
      // Your WebSocket notification code here...
    }

    // 3. Try to sync with the backend, and revert only on failure
    try {
      const { res } = await api.send(`/actions/${collection}/${action}`, {
        body: { targetId: props.id },
      });

      // On success, we can optionally sync with the backend's source of truth.
      // Or, as we do here, simply trust our optimistic update and do nothing.
      // The key is to NOT call setLikes() again here without a good reason.
      api.updateCache(isComment ? "comments" : "posts", props.id, {
        likes: likes(),
      });
    } catch (error) {
      // 4. If the API call fails, revert to the original state
      setLikes(originalLikes);
      haptic.error(); // Provide feedback for the failure

      dispatchAlert({
        type: "error",
        message: `Failed to ${action} post.`,
      });
    }
  }

  async function bookMarkPost() {
    if (!api.authStore.model.username) {
      console.log("not logged in");
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
        message: "Post removed from Bookmarks",
      });
      haptic();

      const newBookmarks = bookmarks().filter((c) => c !== userId);
      setBookmarks(newBookmarks);

      api.resetCache(`posts_bookmarks_feed_${api.authStore.model.id}`);
    } else {
      const newBookmarks = [...bookmarks(), userId];
      setBookmarks(newBookmarks);
      api.metrics.trackUserMetric("posts_bookmarked", props.id);
      dispatchAlert({
        type: "info",
        message: "Added Post To Bookmarks",
        link: "/bookmarks",
      });

      api.resetCache(`posts_bookmarks_feed_${api.authStore.model.id}`);
      haptic();
    }

    try {
      const { res } = await api.send("/actions/posts/bookmark", {
        body: { targetId: props.id },
      });

      if (res && res.bookmarked) {
        setBookmarks(res.bookmarked);
        api.updateCache("posts", props.id, {
          bookmarked: res.bookmarked,
        });
      }
    } catch (error) {
      dispatchAlert({
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  onMount(() => {
    const handler = (event: MessageEvent) => {
      let parsed;
      try {
        parsed = JSON.parse(event.data.data);
      } catch (e) {
        console.log(e);
        return;
      }
      const data = parsed?.data;
      if (!data) return;
      if (
        data.action &&
        (data.action === "like" || data.action === "unlike") &&
        data.targetId === props.id
      ) {
        const current = likes();
        if (data.action === "like" && !current.includes(data.res.author)) {
          setLikes([...current, data.res.author]);
        }
        if (data.action === "unlike") {
          setLikes(current.filter((id) => id !== data.res.author));
        }
      }
    };

    api.worker.ws.addEventListener(handler);

    onCleanup(() => {
      if (api.ws) {
        api.worker.ws.removeEventListener(handler);
      }
    });
  });

  return (
    <Card
      class={joinClass(
        "h-fit z-10",
        "p-3 text-md shadow-none", // Increased base padding
        props.wasReposted && "border border-[#121212]",
        props.disabled
          ? "rounded"
          : `rounded-none shadow-none${
              theme() === "dark" && !props.page
                ? "hover:bg-[#121212]"
                : theme() === "light" && !props.page
                  ? "hover:bg-[#faf9f9]"
                  : ""
            }`,
      )}
    >
      <Show when={pinned() && window.location.pathname.includes("/u")}>
        <div class="flex hero gap-2 items-center mb-2 text-sm text-gray-500">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            class="w-4 h-4 fill-current"
          >
            <g>
              <path d="M7 4.5C7 3.12 8.12 2 9.5 2h5C15.88 2 17 3.12 17 4.5v5.26L20.12 16H13v5l-1 2-1-2v-5H3.88L7 9.76V4.5z"></path>
            </g>
          </svg>
          Pinned
        </div>
      </Show>

      <CardHeader class="flex p-0 flex-row gap-3 relative">
        <Switch>
          <Match when={!props.expand?.author.avatar}>
            <img
              src="/icons/usernotfound/image.png"
              alt={props.author}
              class="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          </Match>
          <Match when={props.expand?.author.avatar}>
            <img
              src={
                api.cdn.getUrl(
                  "users",
                  props.author,
                  props.expand.author.avatar,
                ) || "/placeholder.svg"
              }
              alt={props.author}
              class="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          </Match>
        </Switch>

        {/* --- FIX: STACKED & FLEXIBLE USER INFO FOR RESPONSIVENESS --- */}
        <div class="flex-grow flex justify-between items-start">
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <CardTitle
                class="cursor-pointer font-bold hover:underline"
                onClick={() =>
                  props.navigate(
                    StringJoin("/u/", props.expand.author.username),
                  )
                }
                title={props.expand?.author?.username}
              >
                {props.expand?.author?.username}
              </CardTitle>
              <Show when={props.expand.author.validVerified}>
                <div data-tip="Verified" class="tooltip flex items-center">
                  <svg
                    viewBox="0 0 24 24"
                    class="w-5 h-5 text-blue-500 fill-blue-500"
                  >
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.265-.177-.335-.535-.156-.796.178-.262.538-.334.796-.156l1.921 1.281 3.957-5.936c.178-.267.538-.364.796-.178.267.178.364.528.178.796z" />
                  </svg>
                </div>
              </Show>
            </div>
            <div class="flex items-center text-sm opacity-60">
              <CardTitle
                class="cursor-pointer hover:underline"
                title={
                  props.expand?.author?.handle
                    ? "@" + props.expand.author.handle
                    : ""
                }
              >
                {props.expand?.author?.handle
                  ? "@" + props.expand.author.handle
                  : "@" + props.expand.author.username}
              </CardTitle>
              <span class="mx-1">·</span>
              <span>{created(props.created)}</span>
            </div>
          </div>

          <Show
            when={
              (!props.isComment &&
                !window.location.pathname.includes("/view")) ||
              (props.isComment && window.location.pathname.includes("/view"))
            }
          >
            <div class="dropdown dropdown-left">
              <div tabindex="0" role="button" class="btn btn-ghost btn-sm m-1">
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
                class="dropdown-content mt-2 menu bg-base-100 rounded-box w-52 p-2 shadow z-[99999]"
              >
                <li>
                  <a class="hover:scale-105 transition-transform duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      class="w-4 h-4 hover:animate-pulse"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                      />
                    </svg>
                    Embed Post
                  </a>
                </li>
                <Show when={props.expand.author.id === api.authStore.model.id}>
                  <li>
                    <a
                      onClick={Pin}
                      class="hover:scale-105 transition-transform duration-200"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        class="w-4 h-4 text-black hover:animate-bounce"
                      >
                        <g>
                          <path d="M7 4.5C7 3.12 8.12 2 9.5 2h5C15.88 2 17 3.12 17 4.5v5.26L20.12 16H13v5l-1 2-1-2v-5H3.88L7 9.76V4.5z"></path>
                        </g>
                      </svg>
                      {pinned() ? "Unpin Post" : "Pin Post"}
                    </a>
                  </li>
                </Show>
                <Show
                  when={
                    props.expand.author.id === api.authStore.model.id &&
                    window.location.pathname.includes("/u")
                  }
                >
                  <li>
                    <a
                      onClick={deletePost}
                      class="hover:scale-105 transition-transform duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        class="w-4 h-4 hover:animate-pulse text-red-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      Delete Post
                    </a>
                  </li>
                </Show>
                <li>
                  <a class="hover:scale-105 transition-transform duration-200">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      class="w-4 h-4 hover:animate-pulse"
                    >
                      <g>
                        <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                      </g>
                    </svg>
                    View Engagement
                  </a>
                </li>
                <Show when={props.expand.author.id !== api.authStore.model.id}>
                  <li>
                    <a class="hover:scale-105 transition-transform duration-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        class="w-4 h-4 hover:animate-pulse"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                        />
                      </svg>
                      Report @{props.expand.author.username}
                    </a>
                  </li>
                  <li
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("block-user", {
                          detail: {
                            user: props.expand.author,
                            setPosts: props.setPosts,
                          },
                        }),
                      );
                    }}
                  >
                    <a class="hover:scale-105 transition-transform duration-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        class="w-4 h-4 hover:animate-spin"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                      Block @{props.expand.author.username}
                    </a>
                  </li>
                </Show>
              </ul>
            </div>
          </Show>
        </div>
      </CardHeader>

      <CardContent class="py-2 pl-[52px] cursor-pointer">
        {" "}
        {/* Added left padding to align with avatar */}
        <a
          onClick={() =>
            props.navigate(
              StringJoin(
                "/view/",
                props.isComment ? "comments/" : "posts/",
                props.id,
              ),
            )
          }
        >
          <p class="text-md whitespace-pre-wrap">{props.content}</p>
        </a>
      </CardContent>

      {/* --- FIX: MEDIA ASPECT RATIO AND SIZING --- */}
      <div class="pl-[52px]">
        {" "}
        {/* Wrapper to align media with content */}
        <Switch>
          <Match when={props.embedded_link && !loadedMeta()}>
            <span class="loading loading-spinner loading-2xl flex mx-auto justify-center text-blue-500 mb-5 animate-spin"></span>
          </Match>
          <Match when={props.embedded_link && loadedMeta()}>
            <Show when={_preview_meta().image}>
              <a
                href={props.embedded_link}
                target="_blank"
                rel="noopener noreferrer"
                class="block w-full h-auto mt-2 relative rounded-xl overflow-hidden border"
              >
                <img
                  src={_preview_meta().image}
                  class="w-full h-full object-cover"
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
          <CardContent class="p-0 pt-2">
            <Carousel>
              <For each={props.files} fallback={<></>}>
                {(item) => (
                  <CarouselItem>
                    <Switch>
                      <Match when={getFileType(item) == "image"}>
                        <img
                          onClick={() => {
                            window.open(
                              api.cdn.getUrl(
                                props.isComment ? "comments" : "posts",
                                props.id,
                                item,
                              ),
                              "_blank",
                            );
                          }}
                          src={api.cdn.getUrl(
                            props.isComment ? "comments" : "posts",
                            props.id,
                            item,
                          )}
                          class={joinClass(
                            "w-full aspect-video object-cover rounded-xl cursor-pointer", // FIX: object-cover
                            theme() === "dark"
                              ? "border-[#121212] border"
                              : "border-[#cacaca] border",
                          )}
                        />
                      </Match>
                      <Match when={getFileType(item) == "video"}>
                        <div
                          class={`w-full aspect-video overflow-hidden rounded-xl border ${theme() === "dark" ? "border-[#121212]" : "border-[#cacaca]"}`}
                        >
                          <VideoWithCleanup
                            src={api.cdn.getUrl(
                              props.isComment ? "comments" : "posts",
                              props.id,
                              item,
                            )}
                            class="w-full h-full object-cover" // FIX: object-cover
                          />
                        </div>
                      </Match>
                    </Switch>
                  </CarouselItem>
                )}
              </For>
            </Carousel>
          </CardContent>
        </Show>
      </div>

      <div class="pl-[52px]">
        {" "}
        {/* Wrapper to align repost with content */}
        <CardContent class="p-1">
          <Show when={props.isRepost && props.expand?.repost}>
            {(repost) => (
              <Post
                author={repost().author}
                id={repost().id}
                content={repost().content}
                disabled={true}
                created={repost().created}
                updated={repost().updated}
                expand={repost().expand}
                comments={repost().expand?.comments ?? []}
                files={repost().expand?.files ?? []}
                isLast={false}
                wasReposted={true}
                navigate={props.navigate}
              />
            )}
          </Show>
        </CardContent>
      </div>

      {/* --- FIX: FLEXIBLE FOOTER FOR RESPONSIVENESS --- */}
      <Show when={!props.disabled}>
        <CardFooter class="flex items-center justify-between p-1 mt-2 pl-[52px]">
          {/* Left Icon Group */}
          <div class="flex items-center gap-x-4 sm:gap-x-6 text-gray-500">
            <div
              class="flex items-center gap-1.5 cursor-pointer hover:text-blue-500"
              onClick={() => {
                /* Navigate to comments */
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                />
              </svg>
              <span class="countdown">
                <span
                  style={{
                    "--value": Math.abs(
                      props.comments
                        ? props.comments.length
                        : props.commentCount || commentLength(),
                    ),
                  }}
                ></span>
              </span>
            </div>

            <div
              class="flex items-center gap-1.5 cursor-pointer hover:text-green-500"
              onClick={() => {
                if (api.authStore.model.id) {
                  //@ts-ignore
                  window.repost(props);
                  document.getElementById("createPostModal")?.showModal();
                } else {
                  //@ts-ignore
                  requireSignup();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                />
              </svg>
            </div>

            <div
              class="flex items-center gap-1.5 cursor-pointer"
              onClick={() =>
                updateLikes(api.authStore.model.id, props.isComment)
              }
            >
              <svg
                class={joinClass(
                  "size-5",
                  likes().includes(api.authStore.model.id)
                    ? "fill-red-500 stroke-red-500 text-red-500"
                    : "hover:text-red-500",
                )}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              <span class="countdown" data-likes={likes().length}>
                <span
                  style={{
                    "--value": Math.abs(likes().length),
                    transition: "all 0.2s",
                  }}
                >
                  {likes().length}
                </span>
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                class="size-5 fill-current"
              >
                <g>
                  <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                </g>
              </svg>
              <span class="text-sm">
                {(props.views && props.views.length) || 0}
              </span>
            </div>
          </div>

          {/* Right Icon Group */}
          <div class="flex items-center gap-x-4 sm:gap-x-6 text-gray-500">
            <svg
              onClick={() => bookMarkPost()}
              class={joinClass(
                "size-5 cursor-pointer hover:text-blue-500",
                bookmarks().includes(api.authStore.model.id) &&
                  "fill-blue-500 text-white",
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <svg
              onClick={() => {
                const shareData = {
                  /* ... */
                };
                navigator.share(shareData);
              }}
              class="size-5 cursor-pointer hover:text-sky-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </div>
        </CardFooter>
      </Show>
      <BlockUserModal />
      <DeletePostModal id={props.id} setPosts={props.setPosts} />
    </Card>
  );
}
