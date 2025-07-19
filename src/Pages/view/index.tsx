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
  const [post, setPost] = createSignal<any>(null, { equals: false })
  const [comments, setComments] = createSignal<any[]>([])
  const [loading, setLoading] = createSignal(true)
  const [commentsLoading, setCommentsLoading] = createSignal(true)
  const [comment, setComment] = createSignal<any>({
    content: "",
    media: [],
    likes: [],
    author: api.authStore.model.id,
    ...(collection === "comments" ? { mainComment: "" } : { post: "" }),
  })
  const [files, setFiles] = createSignal<any>([])

  // Ensure auth check on every render
  if (!api.authStore.isValid()) navigate("/auth/login", null)

  const { mobile, desktop, tablet } = useDevice()
  const { theme } = useTheme()

  const fetchP = () => {
    const { id, collection } = useParams()
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

      const { id, collection } = useParams()
      if (id && collection) {
        setLoading(true)
        setCommentsLoading(true)
        setPost(null)
        setComments([])
        fetchP()
      }
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

  // Sleek loading component
  const LoadingPost = () => (
    <div class="p-4 animate-pulse">
      <div class="flex gap-3">
        <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div class="flex-1 space-y-3">
          <div class="flex gap-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div class="flex gap-8 mt-4">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
          </div>
        </div>
      </div>
    </div>
  )

  // Comment with nested replies component
  const CommentWithReplies = (props: { comment: any; index: number; isLast: boolean }) => {
    const { comment, index, isLast } = props
    const hasReplies = comment.expand?.comments && comment.expand.comments.length > 0

    return (
      <div class="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
        {/* Main Comment */}
        <div
          style={{ "margin-bottom": isLast && !hasReplies ? "100px" : "0px" }}
          class="relative hover:bg-gray-50/30 dark:hover:bg-gray-900/30 transition-colors duration-200"
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

        {/* Nested Replies */}
        <Show when={hasReplies}>
          <div class="ml-12 border-l-2 border-gray-100 dark:border-gray-800">
            <For each={comment.expand.comments}>
              {(reply, replyIndex) => (
                <div
                  class="relative hover:bg-gray-50/20 dark:hover:bg-gray-900/20 transition-colors duration-200"
                  style={{
                    "margin-bottom": isLast && replyIndex() === comment.expand.comments.length - 1 ? "100px" : "0px",
                  }}
                >
                  {/* Connection line */}
                  <div class="absolute left-0 top-4 w-4 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div class="pl-4">
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
      <div class="flex flex-col w-full h-full bg-white dark:bg-black min-h-screen">
        {/* Enhanced Header */}
        <div class="sticky top-0 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-8">
              <button
                onClick={() => goBack()}
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors duration-200"
              >
                <ArrowLeft class="w-5 h-5" strokeWidth="2" />
              </button>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">Post</h1>
            </div>
            <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors duration-200">
              <Ellipse class="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div class="flex-1">
          {/* Post Content */}
          <div class="border-b  border-gray-100 dark:border-gray-900">
            <Switch
              fallback={
                <div class="p-8 text-center">
                  <div class="text-red-500 dark:text-red-400 mb-2">
                    <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <p class="text-gray-500 dark:text-gray-400">Something went wrong</p>
                </div>
              }
            >
              <Match when={loading()}>
                <LoadingPost />
              </Match>
              <Match when={post() !== null}>
                <div class="bg-white dark:bg-black">
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
            <div class="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <button class="flex items-center gap-4 p-4 w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group">
                <div class="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors duration-200">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    class="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                  >
                    <g>
                      <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                    </g>
                  </svg>
                </div>
                <div class="flex flex-col items-start">
                  <span class="font-medium text-gray-900 dark:text-white">View Post Analytics</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">See detailed engagement metrics</span>
                </div>
                <svg
                  class="w-4 h-4 text-gray-400 ml-auto group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </Show>

          {/* Enhanced Comments Section with Nested Replies */}
          <div class="pb-20">
            <Switch>
              <Match when={commentsLoading()}>
                <div class="divide-y divide-gray-100 dark:divide-gray-800">
                  <For each={Array(3).fill(0)}>{() => <LoadingPost />}</For>
                </div>
              </Match>
              <Match when={post() && !commentsLoading() && comments().length > 0}>
                <div class="divide-y divide-gray-100 dark:divide-gray-800">
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
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                      <span class="text-2xl">✨</span>
                    </div>
                    <div>
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No comments yet</h3>
                      <p class="text-gray-500 dark:text-gray-400">Be the first to share your thoughts!</p>
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
