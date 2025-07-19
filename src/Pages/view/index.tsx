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
import { Index, onCleanup } from "solid-js"


import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, onMount, Show, Switch, For } from "solid-js";
import Carousel, { CarouselItem } from "@/src/components/UI/UX/Carousel";
import Ellipse from "@/src/components/Icons/Ellipse";
export default function View(props: any) {
  const { route, params, searchParams, navigate, goBack } = useNavigation("/view/:collection/:id")
  const { id, collection } = useParams()
  const [isReplying, setIsReplying] = createSignal(false)
  const [post, setPost] = createSignal<any>(null, { equals: false })
  const [comments, setComments] = createSignal<any[]>([])
  const [loading, setLoading] = createSignal(true)
  const [commentsLoading, setCommentsLoading] = createSignal(true)
  const [comment, setComment] = createSignal<any>({
    content: "",
    media: [],
    likes: [],
    author: api.authStore.model.id,
    ...(collection === "comments" ? { mainComment: id } : { post: id }),
  })
  const [files, setFiles] = createSignal<any>([])

  // Ensure auth check on every render
  if (!api.authStore.isValid()) navigate("/auth/login", null)

  const { mobile, desktop, tablet } = useDevice()
  const { theme } = useTheme()

  const fetchP = () => {
    if (!id || !collection) return

    setLoading(true)
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
          "post.author",
          "post",
          "hashtags",
        ],
      })
      .then((data) => {
        setPost(data)
        if (api.authStore.model.id !== post()?.author?.id) {
          api.metrics.noteMetrics("followed_after_post_view", {
            postId: id,
            authorId: post()?.author,
            hasFollowed: post()?.expand.author?.followers?.includes(api.authStore.model.id),
          })
        }
        window.setRelevantPeople([data.expand.author])
        if (data && data?.hashtags && data?.hashtags.length > 0) {
          data.expand.hashtags.map((hashtag: any) => {
            api.metrics.trackUserMetric("viewed_hashtags", hashtag.id)
          })
          api.metrics.uploadUserMetrics()
        }
        window.setWhoCanReply(data?.whoCanSee && data?.whoCanSee.length > 0 ? data?.whoCanSee[0] : [])
        window.setMainPost(data)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })

    // Fetch comments with nested replies
    setCommentsLoading(true)
    api
      .collection("comments")
      .list(1, 10, {
        filter: collection === "comments" ? `mainComment="${id}"` : `post="${id}"`,
        expand: ["author", "likes", "comments", "comments.author", "comments.likes"],
        cacheKey: `${collection}-${id}-comments`,
        sort: "-created",
      })
      .then((data) => {
        console.log(data)
        setComments(data.items)
        setCommentsLoading(false)
      })
      .catch(() => {
        setCommentsLoading(false)
      })
  }

  onMount(() => {
    const listener = (e) => {
      const newComment = e.detail
      setComments((comments) => [newComment, ...comments])
      setPost((post) => ({
        ...post,
        comments: [...(post.comments || []), newComment.id],
      }))
    }

    window.addEventListener("popstate", () => {
      setPost(null)
      setLoading(true)
      setCommentsLoading(true)
    })
    window.addEventListener("commentCreated", listener)
    fetchP()

    onCleanup(() => {
      window.removeEventListener("commentCreated", listener)
    })
  })

  createEffect(() => {
    if (id) {
      setLoading(true)
      setCommentsLoading(true)
      setPost(null)
      setComments([])
      fetchP()
    }
  })

  // Sleek loading component with proper theme support
  const LoadingPost = () => (
    <div class="p-4 animate-pulse">
      <div class="flex gap-3">
        <div class={`w-10 h-10 rounded-full ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
        <div class="flex-1 space-y-3">
          <div class="flex gap-2">
            <div class={`h-4 rounded w-20 ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
            <div class={`h-4 rounded w-16 ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
            <div class={`h-4 rounded w-12 ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
          </div>
          <div class="space-y-2">
            <div class={`h-4 rounded w-full ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
            <div class={`h-4 rounded w-3/4 ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
          </div>
          <div class="flex gap-8 mt-4">
            <div class={`h-4 rounded w-8 ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
            <div class={`h-4 rounded w-8 ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
            <div class={`h-4 rounded w-8 ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
            <div class={`h-4 rounded w-8 ${theme() === "dark" ? "bg-gray-700" : "bg-gray-200"}`}></div>
          </div>
        </div>
      </div>
    </div>
  )

  // Comment with nested replies component - Twitter-style threading
  const CommentWithReplies = (props: { comment: any; index: number; isLast: boolean }) => {
    const { comment, index, isLast } = props
    const hasReplies = comment.expand?.comments && comment.expand.comments.length > 0

    return (
      <div class="relative">
        {/* Main Comment */}
        <div
          style={{ "margin-bottom": isLast && !hasReplies ? "100px" : "0px" }}
          class={`relative transition-colors duration-200 border-b ${
            theme() === "dark" ? "hover:bg-gray-900/30 border-gray-800" : "hover:bg-gray-50/30 border-gray-100"
          }`}
        >
          <Post
            {...{
              ...comment,
              page: route(),
              navigate,
              isComment: true,
              postId: id,
              isReply: collection === "comments",
              replyTo: post()?.expand?.author?.id,
            }}
          />
        </div>

        {/* Nested Replies with connecting line */}
        <Show when={hasReplies}>
          <div class="relative">
            {/* Vertical connecting line from parent avatar to first reply */}
            <div
              class={`absolute left-[34px] top-0 w-0.5 h-4 ${theme() === "dark" ? "bg-gray-600" : "bg-gray-300"}`}
            ></div>

            <For each={comment.expand.comments}>
              {(reply, replyIndex) => (
                <div class="relative">
                  {/* Connecting line structure */}
                  <div
                    class={`absolute left-[34px] top-0 w-0.5 h-[52px] ${theme() === "dark" ? "bg-gray-600" : "bg-gray-300"}`}
                  ></div>
                  <div
                    class={`absolute left-[34px] top-[52px] w-4 h-0.5 ${theme() === "dark" ? "bg-gray-600" : "bg-gray-300"}`}
                  ></div>

                  {/* Reply content */}
                  <div
                    class={`relative transition-colors duration-200 border-b ${
                      theme() === "dark"
                        ? "hover:bg-gray-900/20 border-gray-800"
                        : "hover:bg-gray-50/20 border-gray-100"
                    }`}
                    style={{
                      "margin-bottom": isLast && replyIndex() === comment.expand.comments.length - 1 ? "100px" : "0px",
                    }}
                  >
                    <Post
                      {...{
                        ...reply,
                        page: route(),
                        navigate,
                        isComment: true,
                        isReply: true,
                        postId: id,
                        replyTo: comment.expand?.author?.id,
                      }}
                    />
                  </div>

                  {/* Continue vertical line to next reply if not last */}
                  <Show when={replyIndex() < comment.expand.comments.length - 1}>
                    <div
                      class={`absolute left-[34px] top-[52px] w-0.5 h-4 ${theme() === "dark" ? "bg-gray-600" : "bg-gray-300"}`}
                    ></div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    )
  }

  return (
    <Page {...{ params, route, navigate: props.navigate }} id={id}>
      <div
        class={`flex flex-col w-full h-full min-h-screen ${theme() === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
      >
        {/* Enhanced Header */}
        <div
          class={`sticky top-0 z-10 backdrop-blur-md border-b ${
            theme() === "dark" ? "bg-black/95 border-gray-800" : "bg-white/95 border-gray-200"
          }`}
        >
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-8">
              <button
                onClick={() => goBack()}
                class={`p-2 rounded-full transition-colors duration-200 ${
                  theme() === "dark" ? "hover:bg-gray-900 text-white" : "hover:bg-gray-100 text-black"
                }`}
              >
                <ArrowLeft class="w-5 h-5" strokeWidth="2" />
              </button>
              <h1 class={`text-xl font-bold ${theme() === "dark" ? "text-white" : "text-gray-900"}`}>Post</h1>
            </div>
            <button
              class={`p-2 rounded-full transition-colors duration-200 ${
                theme() === "dark" ? "hover:bg-gray-900 text-white" : "hover:bg-gray-100 text-black"
              }`}
            >
              <Ellipse class="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div class="flex-1">
          {/* Post Content */}
          <div class={`border-b  ${theme() === "dark" ? "border-gray-900" : "border-gray-100"}`}>
            <Switch
              fallback={
                <div class="p-8 text-center">
                  <div class={`mb-2 ${theme() === "dark" ? "text-red-400" : "text-red-500"}`}>
                    <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <p class={theme() === "dark" ? "text-gray-400" : "text-gray-500"}>Something went wrong</p>
                </div>
              }
            >
              <Match when={loading()}>
                <LoadingPost />
              </Match>
              <Match when={post() !== null}>
                <div class={theme() === "dark" ? "bg-black" : "bg-white"}>
                  <Post
                    {...{
                      ...post(),
                      page: route(),
                      navigate,
                      isComment: collection === "comments",
                    }}
                    commentCount={post().comments?.length || 0}
                  />
                </div>
              </Match>
            </Switch>
          </div>

          {/* Enhanced Post Analytics Section */}
          <Show when={post() && post().author === api.authStore.model.id}>
            <div
              class={`border-b ${
                theme() === "dark" ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <button
                class={`flex items-center gap-4 p-4 w-full transition-colors duration-200 group ${
                  theme() === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <div
                  class={`p-2 rounded-full transition-colors duration-200 ${
                    theme() === "dark"
                      ? "bg-blue-900/20 group-hover:bg-blue-900/40"
                      : "bg-blue-50 group-hover:bg-blue-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    class={`w-5 h-5 ${theme() === "dark" ? "text-blue-400" : "text-blue-600"}`}
                    fill="currentColor"
                  >
                    <g>
                      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                    </g>
                  </svg>
                </div>
                <div class="flex flex-col items-start">
                  <span class={`font-medium ${theme() === "dark" ? "text-white" : "text-gray-900"}`}>
                    View Post Analytics
                  </span>
                  <span class={theme() === "dark" ? "text-gray-400" : "text-gray-500"}>
                    See detailed engagement metrics
                  </span>
                </div>
                <svg
                  class={`w-4 h-4 ml-auto transition-colors ${
                    theme() === "dark"
                      ? "text-gray-400 group-hover:text-gray-300"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </Show>

          {/* Enhanced Comments Section with Twitter-style Threading */}
          <div class="pb-20">
            <Switch>
              <Match when={commentsLoading()}>
                <div class={`divide-y ${theme() === "dark" ? "divide-gray-800" : "divide-gray-100"}`}>
                  <For each={Array(3).fill(0)}>{() => <LoadingPost />}</For>
                </div>
              </Match>
              <Match when={post() && !commentsLoading() && comments().length > 0}>
                <div>
                  <For each={comments()}>
                    {(comment, index) => (
                      <CommentWithReplies
                        comment={comment}
                        index={index()}
                        isLast={index() === comments().length - 1}
                      />
                    )}
                  </For>
                </div>
              </Match>
              <Match when={post() && !commentsLoading() && comments().length < 1}>
                <div class="p-12 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <div
                      class={`w-16 h-16 rounded-full flex items-center justify-center ${
                        theme() === "dark"
                          ? "bg-gradient-to-br from-blue-900/20 to-purple-900/20"
                          : "bg-gradient-to-br from-blue-100 to-purple-100"
                      }`}
                    >
                      <span class="text-2xl">✨</span>
                    </div>
                    <div>
                      <h3 class={`text-lg font-medium mb-1 ${theme() === "dark" ? "text-white" : "text-gray-900"}`}>
                        No comments yet
                      </h3>
                      <p class={theme() === "dark" ? "text-gray-400" : "text-gray-500"}>
                        Be the first to share your thoughts!
                      </p>
                    </div>
                  </div>
                </div>
              </Match>
            </Switch>
          </div>
        </div>

        

       
      </div>
    </Page>
  )
}

