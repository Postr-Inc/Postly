import { createSignal, For, createEffect, onMount, onCleanup } from "solid-js";
import useTheme from "../../Utils/Hooks/useTheme";
import { api } from "@/src";
import { joinClass } from "@/src/Utils/Joinclass";
import { Portal, Show, Switch, Match } from "solid-js/web";
import Post from "../PostRelated/Post";
import Media from "../Icons/Media";
import Dropdown, { DropdownHeader } from "../UI/UX/dropdown";
import World from "../Icons/World";
import Users from "../Icons/Users";
import Modal from "../Modal";
import User from "../Icons/User";
import CheckMark from "../Icons/BasicCheck";
import Carousel from "../UI/UX/Carousel";
import NumberedList from "../Icons/NumberedList";
import { HttpCodes } from "@/src/Utils/SDK/opCodes";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import { getFileType, getDynamicImageQuality, compressImage, prepareFile } from "@/src/Utils/BetterHandling";
import { dispatchAlert } from "@/src/Utils/SDK";
import { GeneralTypes } from "@/src/Utils/SDK/Types/GeneralTypes";
const getTopicIcon = (icon: string) => {
  switch (icon) {
    case "technology":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
        </svg>
      )
    case "science":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25L12 3 4.5 14.25M12 3v18" />
        </svg>
      )
    case "gaming":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v3m0 12v3m9-9h-3m-12 0H3m15.364-6.364l-2.121 2.121M6.757 6.757l2.121 2.121M6.757 17.243l2.121-2.121m10.486 0l-2.121 2.121" />
        </svg>
      )
    case "health":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4.5-2-9-6.5-9-11.25C3 6.269 5.269 4 8.25 4c1.45 0 2.794.81 3.75 2.057C13.956 4.81 15.3 4 16.75 4 19.731 4 22 6.269 22 9.75c0 4.75-4.5 9.25-10 11.25Z" />
        </svg>
      )
    case "art":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 3L12 8.25M12 8.25L8.25 3M12 8.25v12" />
        </svg>
      )
    case "sports":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 0 1-6 0M12 3v9m0 0v9" />
        </svg>
      )
    case "business":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V9.75a2.25 2.25 0 0 1 2.25-2.25h1.5A2.25 2.25 0 0 1 15 9.75V17m0 0v-4.5m-6 4.5v-3" />
        </svg>
      )
    case "entertainment":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25m0 0L12 3m3.75 2.25L21 3m-5.25 5.25L12 21m0 0l-3.75-8.25M12 21l3.75-8.25" />
        </svg>
      )
    default:
      return null
  }
}
function extractFirstURL(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches[0] : null;
}


export default function CreatePostModal() {
  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    return date.toISOString().split("T")[0];
  };

  const { navigate } = useNavigation()
  const { theme } = useTheme();
  let [params, setParams] = createSignal<any>(null);
  let [isPosting, setIsPosting] = createSignal(false);
  let [files, setFiles] = createSignal<any>([], { equals: false });
  let [canCommentOnPost, setCanCommentOnPost] = createSignal(true)
  let [mainPost, setMainPost] = createSignal({})
  let [replyRule, setReplyRule] = createSignal("public")
  let [hasError, setHasError] = createSignal(false, { equals: false })
  let [error, setError] = createSignal(null)
  let [topics, setTopics] = createSignal<any[]>([])
  const [collection, setCollection] = createSignal(window.location.pathname.split("/")[2] === "posts" && window.location.pathname.includes("view") ? "comments" : window.location.pathname.split("/")[2] === "comments" && window.location.pathname.includes("view") ? "comments" : "posts")
  let [postData, setPostData] = createSignal<any>({
    content: "",
    links: [],
    tags: [],
    author: JSON.parse(localStorage.getItem("postr_auth") || "{}").id,
    isRepost: false,
    isPoll: false,
    repost: "",
    topic: null,
    whoCanSee: "public",
    embedded_link: null,
    _preview_meta: null,
  });

  createEffect(() => {
    const content = postData().content;
    const url = extractFirstURL(content);

    // Avoid refetching if the link hasn't changed
    if (!url || url === postData().embedded_link) return;

    // Update only if new URL
    setPostData((prev) => ({ ...prev, embedded_link: url, _preview_meta: null }));

    fetch(`${api.serverURL}/opengraph/embed?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((meta) => {
        // Avoid set loop by checking if meta already set
        console.log(meta)
        setPostData((prev) => ({ ...prev, _preview_meta: meta, content: prev.content.replace(url, "").trim(), }));
      })
      .catch(() => {
        setPostData((prev) => ({ ...prev, _preview_meta: null, content: prev.content.replace(url, "").trim(), }));
      });
  });

  let [Drafts, setDrafts] = createSignal(
    localStorage.getItem("postDrafts") ? JSON.parse(localStorage.getItem("drafts") as any) : []
  )


  async function createPost() {
    if (isPosting()) return;
    setIsPosting(true);
    setHasError(false);


    const data = { ...postData(), author: JSON.parse(localStorage.getItem("postr_auth") || "{}").id };
    if(data.topic){
      data.topic = data.topic.id
    }
    if (!data.author) {
      document.getElementById("createPostModal")?.close();
      dispatchAlert({ type: "error", "message": "Author missing can not create post" })
      return;
    }
    if (data.isRepost) data.repost = data.repost.id;

    try {
      if (files().length > 0) {
        data.files = await Promise.all(
          files().map((f) => prepareFile(f))
        );
        if (data.files.some((f: any) => f.type.includes("video"))) {
          data.isSnippet = true;
        }
      }

      if (collection() === "comments") {
        const parts = window.location.pathname.split("/");
        if (!window.location.pathname.includes("posts")) {
          data.mainComment = parts[3];
        } else {
          data.post = parts[3];
        }
      }

      const res = await api.collection(collection()).create(data, {
        expand: [
          "author", "author.following", "author.followers",
          "author.TypeOfContentPosted", "likes", "repost.likes",
          "repost.author", "repost"
        ],
        invalidateCache: [
          `/u/user_${api.authStore.model.username}_posts`,
          ...(collection() == "comments" ? `${collection()}-${data.mainComment}-comments` : `post-${data.post}`),
          `/u/user_${api.authStore.model.username}/comments`
        ],
      }) as any;

      if(data.topic){
        await api.collection("topics").update(data.topic, {
          posts: [...topics().find((i)=> i.id === data.topic).posts, res.id]
        }, {
          invalidateCache: ["topics", "topic-get", `topic-${topics().find((i)=> i.id === data.topic).name}_feed`]
        })
      }

      setPostData({
        content: "", links: [], tags: [],
        isRepost: false, isPoll: false,
        hashtags: [], whoCanSee: "public",
        _preview_meta: null, embedded_link: null,
        topic: null
      });

      if (api.ws) {
        api.ws.send(JSON.stringify({
          payload: {
            type: GeneralTypes.NOTIFY,
            notification_data: {
              author: api.authStore.model.id,
              post: res.id,
              comment: "",
              recipients: api.authStore.model.followers,
              url: `${window.location.host}/view/${res.id}`,
              notification_title: `${api.authStore.model.username} Has Posted Click to View New Post`,
              notification_body: res.content,
              message: res.content,
              icon: `${api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar || "")}`
            }
          },
          security: {
            token: api.authStore.model.token
          }
        }))
      }
      setFiles([]);
      setIsPosting(false);

      if (collection() === "comments") {
        document.getElementById("createPostModal")?.close();

        const postId = window.location.pathname.split("/")[3];
        const p = await api.collection(window.location.pathname.split("/")[2])
        const d = await api.collection(window.location.pathname.split("/")[2]).update(postId, {
          comments: [...(p.comments || []), res.id],
          invalidateCache: [
            `/u/user_${api.authStore.model.username}_posts`,
            `post-${data.post}`,
            `/u/user_${api.authStore.model.username}/comments`
          ],
        });
        api.updateCache("comments", postId, d);

        window.dispatchEvent(new CustomEvent("commentCreated", { detail: res }));
      } else {
        setTimeout(() => navigate(`/view/posts/${res.id}`), 100);
      }

    } catch (error: any) {
      setHasError(true);
      setError(error.message || "Unknown error");
      setIsPosting(false);
      console.error("Error creating post:", error);
    }
  }


  async function draft() {
    if (localStorage.getItem("postDrafts")) {
      var _drafts = Drafts()
      _drafts.push(postData())
      localStorage.setItem("postDrafts", JSON.stringify(_drafts))
    }
  }

  const postMessages = [
    "We’re creating your post. This might take a few seconds if you added images or videos.",
    "Compressing media and optimizing your content...",
    "Uploading... almost there!",
    "Hang tight! Wrapping up your post creation.",
    "Finalizing your post. We’ll be done shortly.",
  ];

  const [currentMessage, setCurrentMessage] = createSignal(postMessages[0]);

  onMount(async () => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * postMessages.length);
      setCurrentMessage(postMessages[randomIndex]);
    }, 3000); // Change every 3 seconds

    onCleanup(() => clearInterval(interval));
    let topics = await api.collection("topics").list(1, 20, {
      cacheKey: `topics`,
      filter: ``,
      expand: ["Users_Subscribed"]
    })

    setTopics(topics.items)
  });

  //@ts-ignore
  window.setParams = (params: any) => {
    setParams(params);
  };

  //@ts-ignore
  window.repost = (post: any) => {
    setPostData({ ...postData(), isRepost: true, repost: post, hidden: ["repostButton"] });
  }
  //@ts-ignore
  window.resetCreatePost = () => {
    setCollection(window.location.pathname.split("/")[2] === "posts" ? "comments" : window.location.pathname.split("/")[2] === "comments" ? "comments" : "posts");
  }

  //@ts-ignore
  window.setWhoCanReply = (rule) => {
    if (rule == "private") {
      setCanCommentOnPost(false)
      setReplyRule(rule)
    }
  }

  //@ts-ignore
  window.setMainPost = (data) => {
    setMainPost(data)
  }

  function closeAndReset() {
    setCanCommentOnPost(true)
    setReplyRule("public")
    setCollection(window.location.pathname.split("/")[2] === "posts" ? "comments" : "posts");
    setPostData({
      content: "",
      links: [],
      tags: [],
      author: JSON.parse(localStorage.getItem("postr_auth") || "{}").id,
      isRepost: false,
      isPoll: false,
      topic: null,
      repost: "",
      whoCanSee: "public",
      embedded_link: null,
      _preview_meta: null
    })
    document.getElementById("createPostModal")?.close();
  }


  console.log(postData())
  return (
    <dialog id="createPostModal" class="modal w-screen h-screen z-[-1f]">
      <Switch>
        <Match when={isPosting() && !hasError()}>
          <div class={joinClass("modal-box scroll focus:outline-none p-4 h-fit relative   border-4 rounded-xl border-transparent z-[-1] animate-gradient-border   shadow-xl text-center")}>
            <div class="absolute inset-0 rounded-xl border-4 border-transparent pointer-events-none animate-border-overlay"></div>

            <h2 class="text-xl font-semibold mb-4">Hang tight!</h2>
            <p class="text-sm  mb-6">{currentMessage()}</p>

            <div class="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </Match>
        <Match when={!isPosting() && !hasError()}>
          <div class={joinClass("modal-box scroll focus:outline-none       p-2  text-black z-[-1] rounded-xl   ",
            theme() == "dark" ? "bg-base-300 text-white" : "bg-white"
          )}>
            <div class="flex flex-row  h-full justify-between  ">
              <button
                class="btn btn-sm focus:outline-none btn-circle btn-ghost  "
                onClick={closeAndReset}
              >
                ✕
              </button>
              <p class="text-blue-500 btn btn-sm rounded-full">Drafts</p>
            </div>
            <div class={joinClass("flex flex-row h-full overflow-hidden  text-lg mt-5",
            )}>

              <div class="flex flex-col w-full h-full gap-2 overflow-hidden  ">

                <textarea
                  value={postData().content}
                  maxLength={400}
                  class={joinClass(
                    "    bg-transparent  w-full rounded-lg  p-3 resize-none overflow-hidden  outline-none scroll",
                    postData().content.length > 100 ? "h-[24rem]" : ""
                  )}
                  placeholder={
                    (canCommentOnPost() && replyRule() == "public") ||
                      (!canCommentOnPost() &&
                        mainPost() &&
                        mainPost().expand &&
                        mainPost().expand.author &&
                        mainPost().expand.author.id === api.authStore.model.id)
                      ? "What is on your mind?"
                      : "Post replies are restricted, only the author can reply"
                  }
                  disabled={
                    !(
                      (canCommentOnPost() && replyRule() == "public") ||
                      (
                        !canCommentOnPost() &&
                        mainPost() &&
                        mainPost().expand &&
                        mainPost().expand.author &&
                        mainPost().expand.author.id === api.authStore.model.id
                      )
                    )
                  }
                  onInput={(e: any) => {
                    setPostData({ ...postData(), content: e.target.value });
                  }}
                ></textarea>




                <Show when={postData().isRepost}>
                  <Post {...postData().repost} />
                </Show>
              </div>
            </div>
            <Show when={postData()._preview_meta}>

              <a
                href={postData().embedded_link}
                target="_blank"
                rel="noopener noreferrer"
                class="block w-full h-[20rem] mt-12 relative rounded-xl overflow-hidden border"
              >
                <img
                  src={postData()._preview_meta?.image || '/placeholder.png'}
                  class="w-full h-full object-cover"
                  alt="Link preview"
                />
                <div class="absolute bottom-0 bg-black bg-opacity-60 text-white p-2 text-sm w-full">
                  {postData()._preview_meta?.title || "Untitled"}
                </div>
              </a>
            </Show>
            <Show when={files().length > 0}>
              <Carousel>
                <For each={files()}>
                  {(file: File) => (
                    <Carousel.Item
                      showDelete={true}
                      id={file.name}
                      onDeleted={() => {
                        setFiles(files().filter((f: any) => f.name !== file.name));
                      }

                      }
                    >
                      <Switch>
                        <Match when={getFileType(file) == "image"}>
                          <img
                            src={URL.createObjectURL(file)}
                            class="w-full h-[20rem] object-cover rounded-lg my-2"
                            alt="file"
                          />
                        </Match>
                        <Match when={getFileType(file) == "video"}>
                          <video src={URL.createObjectURL(file)} autoplay loop class="w-full h-[20rem] object-cover rounded-lg my-2" alt="file" />
                        </Match>
                      </Switch>
                    </Carousel.Item>
                  )}
                </For>
              </Carousel>
            </Show>

            <div class="flex">
              <div
                class="flex flex-row fill-blue-500 hero text-blue-500 font-semibold gap-2 hover:bg-base-200  w-fit cursor-pointer p-2 rounded-full"
                onClick={() => document.getElementById("visibility")?.showModal()}
              >
                <Switch>
                  <Match when={postData().whoCanSee === "public"}>
                    <World class="w-5 h-5" />
                    <p>Everyone can reply</p>
                  </Match>
                  <Match when={postData().whoCanSee === "following"}>
                    <Users class="w-5 h-5" />
                    <p>Accounts you follow</p>
                  </Match>
                  <Match when={postData().whoCanSee === "private"}>
                    <User class="w-5 h-5" />
                    <p>Only you</p>
                  </Match>
                </Switch>
              </div>
              <div
                class="flex flex-row fill-purple-500 hero text-sm  font-semibold gap-2 hover:bg-base-200 w-fit cursor-pointer p-2 rounded-full"
                onClick={() => document.getElementById("topicPicker")?.showModal()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                </svg>

                <p>{console.log("rendered with", postData().topic?.name) || postData().topic?.name || "Topic"}</p>

              </div>

            </div>

            <Portal>
              <dialog
                id="visibility"
                class="modal sm:modal-bottom xl:modal-middle md:modal-middle  "
              >
                <div class="modal-box w-32 gap-1">
                  <div class="flex flex-col gap-2">
                    <p class="font-bold">Who can reply to this post?</p>
                    <p>Choose who is allowed to reply to your post.</p>
                  </div>
                  <div class="flex flex-col relative gap-2 mt-5">
                    <div
                      class="flex flex-row gap-5 font-bold cursor-pointer text-lg hero"
                      onClick={() => {
                        setPostData({ ...postData(), whoCanSee: "public" });
                        document.getElementById("visibility")?.close();
                      }}
                    >
                      <div class="p-3 bg-blue-500 rounded-full">
                        <World class="w-5 h-5 fill-white stroke-blue-500" />
                      </div>
                      <p>Everyone</p>
                      {postData().whoCanSee === "public" && (
                        <CheckMark class="w-5 h-5 text-blue-500 absolute right-5" />
                      )}
                    </div>
                    <div
                      class="flex flex-row gap-5 font-bold cursor-pointer text-lg hero"
                      onClick={() => {
                        setPostData({ ...postData(), whoCanSee: "following" });
                        document.getElementById("visibility")?.close();
                      }}
                    >
                      <div class="p-3 bg-blue-500 rounded-full">
                        <Users class="w-5 h-5 fill-white stroke-blue-500" />
                      </div>
                      <p>Following</p>
                      {postData().whoCanSee === "following" && (
                        <CheckMark class="w-5 h-5 text-blue-500 absolute right-5" />
                      )}
                    </div>
                    <div
                      class="flex flex-row gap-5 font-bold cursor-pointer text-lg hero"
                      onClick={() => {
                        setPostData({ ...postData(), whoCanSee: "private" });
                        document.getElementById("visibility")?.close();
                      }}
                    >
                      <div class="p-3 bg-blue-500 rounded-full">
                        <User class="w-5 h-5 fill-white stroke-blue-500" />
                      </div>
                      <p>Only me</p>
                      {postData().whoCanSee === "private" && (
                        <CheckMark class="w-5 h-5 text-blue-500 absolute right-5" />
                      )}
                    </div>
                  </div>
                </div>
              </dialog>
            </Portal>
            <Portal>
              <dialog id="topicPicker" class="modal sm:modal-bottom xl:modal-middle md:modal-middle">
                <div class="modal-box">
                  <div class="flex flex-col gap-2">
                    <p class="font-bold text-lg">Choose a topic</p>
                    <p class="text-sm text-gray-500">Pick a topic that matches your post.</p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 max-h-80 overflow-y-auto">
                    <For each={topics()}>
                      {(topic) => (
                        <div
                          class="flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-base-200 transition"
                          onClick={() => {
                            setPostData(prev => ({ ...prev, topic }));
                            document.getElementById("topicPicker")?.close();
                          }}
                        >
                          <div class="p-2 bg-purple-100 rounded-full">
                            {getTopicIcon(topic.icon)}
                          </div>
                          <p class="font-medium">{topic.name}</p>
                          {postData().topic?.id === topic.id && (
                            <CheckMark class="w-5 h-5 text-purple-600 ml-auto" />
                          )}
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </dialog>
            </Portal>

            <div class="divider  rounded-full h-1"></div>
            <div class="flex flex-row  relative justify-between ">
              <input
                type="file"
                hidden
                id="files"
                onInput={(file: any) => setFiles(Array.from(file.target.files))}
                multiple
                accept="image/*, video/*"
              />
              <div class="flex flex-row gap-5">
                <Media
                  class={joinClass(
                    "w-5 h-5 cursor-pointer",
                    postData().isPoll && "opacity-50"
                  )}
                  onClick={() =>
                    !postData().isPoll && document.getElementById("files")?.click()
                  }
                />

              </div>
              {/**
           * verticle line
           */}
              <span>{postData().content.length} / 400</span>
              <button
                class="btn-sm bg-blue-500 text-white rounded-full"
                onClick={() => {
                  if (
                    replyRule() == "private" &&
                    !(
                      mainPost() &&
                      mainPost().expand &&
                      mainPost().expand.author &&
                      mainPost().expand.author.id === api.authStore.model.id
                    )
                  )
                    return;
                  createPost();
                }}
              >
                {isPosting()
                  ? "Posting..."
                  : collection() === "posts"
                    ? "Post"
                    : replyRule() == "private" &&
                      !(
                        mainPost() &&
                        mainPost().expand &&
                        mainPost().expand.author &&
                        mainPost().expand.author.id === api.authStore.model.id
                      )
                      ? "Author Set Comments Private"
                      : "Create Comment"}
              </button>
            </div>
          </div>
        </Match>
        <Match when={hasError()}>
          <div class="modal-box  p-2 z-[-1] h-fit">
            <div class="flex flex-row justify-between  ">
              <button
                class="btn btn-sm focus:outline-none btn-circle btn-ghost  "
                onClick={closeAndReset}
              >
                ✕
              </button>
              <p class="text-blue-500 btn btn-sm rounded-full">Drafts</p>
            </div>
            <div class="flex flex-row  text-lg mt-5">
              <div class="flex flex-col w-full gap-2">
                <textarea
                  maxLength={400}
                  class={joinClass(
                    "w-full h-fit  rounded-lg mx-5 resize-none outline-none scroll",
                    theme() === "dark" ? "bg-black text-white" : "bg-white"
                  )}
                  placeholder={`Error Occured :/`}
                  disabled={true}
                ></textarea>

                <Show when={postData().repost}>
                  <Post {...postData().repost} />
                </Show>
              </div>
            </div>
            <p class="p-5">
              {error()}
            </p>
            <Show when={files().length > 0}>
              <Carousel>
                <For each={files()}>
                  {(file: File) => (
                    <Carousel.Item
                      showDelete={true}
                      id={file.name}
                      onDeleted={() => {
                        setFiles(files().filter((f: any) => f.name !== file.name));
                      }

                      }
                    >
                      <Switch>
                        <Match when={getFileType(file) == "image"}>
                          <img
                            src={URL.createObjectURL(file)}
                            class="w-full h-[20rem] object-cover rounded-lg my-2"
                            alt="file"
                          />
                        </Match>
                        <Match when={getFileType(file) == "video"}>
                          <video src={URL.createObjectURL(file)} autoplay loop class="w-full h-[20rem] object-cover rounded-lg my-2" alt="file" />
                        </Match>
                      </Switch>
                    </Carousel.Item>
                  )}
                </For>
              </Carousel>
            </Show>
            <Show when={postData()._preview_meta}>
              <a
                href={postData()._preview_meta.url}
                target="_blank"
                class="block border p-2 rounded mt-2"
              >
                <div class="flex gap-4">
                  <img
                    src={postData()._preview_meta.image}
                    class="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <p class="font-bold">{postData()._preview_meta.title}</p>
                    <p class="text-sm text-gray-500">{postData()._preview_meta.description}</p>
                    <p class="text-xs text-blue-500">{postData()._preview_meta.url}</p>
                  </div>
                </div>
              </a>
            </Show>

            <div
              class="flex flex-row fill-blue-500 hero text-blue-500 font-semibold gap-2 hover:bg-base-200  w-fit cursor-pointer p-2 rounded-full"
              onClick={() => document.getElementById("visibility")?.showModal()}
            >
              <Switch>
                <Match when={postData().whoCanSee === "public"}>
                  <World class="w-5 h-5" />
                  <p>Everyone can reply</p>
                </Match>
                <Match when={postData().whoCanSee === "following"}>
                  <Users class="w-5 h-5" />
                  <p>Accounts you follow</p>
                </Match>
                <Match when={postData().whoCanSee === "private"}>
                  <User class="w-5 h-5" />
                  <p>Only you</p>
                </Match>
              </Switch>
            </div>
            <Portal>
              <dialog
                id="visibility"
                class="modal sm:modal-bottom xl:modal-middle md:modal-middle  "
              >
                <div class="modal-box w-32 gap-1">
                  <div class="flex flex-col gap-2">
                    <p class="font-bold">Who can reply to this post?</p>
                    <p>Choose who is allowed to reply to your post.</p>
                  </div>
                  <div class="flex flex-col relative gap-2 mt-5">
                    <div
                      class="flex flex-row gap-5 font-bold cursor-pointer text-lg hero"
                      onClick={() => {
                        setPostData({ ...postData(), whoCanSee: "public" });
                        document.getElementById("visibility")?.close();
                      }}
                    >
                      <div class="p-3 bg-blue-500 rounded-full">
                        <World class="w-5 h-5 fill-white stroke-blue-500" />
                      </div>
                      <p>Everyone</p>
                      {postData().whoCanSee === "public" && (
                        <CheckMark class="w-5 h-5 text-blue-500 absolute right-5" />
                      )}
                    </div>
                    <div
                      class="flex flex-row gap-5 font-bold cursor-pointer text-lg hero"
                      onClick={() => {
                        setPostData({ ...postData(), whoCanSee: "following" });
                        document.getElementById("visibility")?.close();
                      }}
                    >
                      <div class="p-3 bg-blue-500 rounded-full">
                        <Users class="w-5 h-5 fill-white stroke-blue-500" />
                      </div>
                      <p>Following</p>
                      {postData().whoCanSee === "following" && (
                        <CheckMark class="w-5 h-5 text-blue-500 absolute right-5" />
                      )}
                    </div>
                    <div
                      class="flex flex-row gap-5 font-bold cursor-pointer text-lg hero"
                      onClick={() => {
                        setPostData({ ...postData(), whoCanSee: "private" });
                        document.getElementById("visibility")?.close();
                      }}
                    >
                      <div class="p-3 bg-blue-500 rounded-full">
                        <User class="w-5 h-5 fill-white stroke-blue-500" />
                      </div>
                      <p>Only me</p>
                      {postData().whoCanSee === "private" && (
                        <CheckMark class="w-5 h-5 text-blue-500 absolute right-5" />
                      )}
                    </div>
                  </div>
                </div>
              </dialog>
            </Portal>
            <div class="divider  rounded-full h-1"></div>
            <div class="flex flex-row  relative justify-between ">
              <input
                type="file"
                hidden
                id="files"
                onInput={(file: any) => setFiles(Array.from(file.target.files))}
                multiple
                disabled={true}
                accept="image/*, video/*"
              />
              <div class="flex flex-row gap-5">
                <Media
                  class={joinClass(
                    "w-5 h-5 cursor-pointer",
                    postData().isPoll && "opacity-50"
                  )}
                />
                <NumberedList
                  class={joinClass(
                    "w-5 h-5 cursor-pointer",
                    files().length > 0 && "opacity-50",
                    postData().isPoll && "text-blue-500"
                  )}
                />
              </div>
              {/**
           * verticle line
           */}
            </div>
          </div>

        </Match>
      </Switch>
    </dialog>
  );
}
