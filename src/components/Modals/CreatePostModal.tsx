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
  const [collection, setCollection] = createSignal(window.location.pathname.split("/")[2] === "posts" && window.location.pathname.includes("view") ? "comments" : window.location.pathname.split("/")[2] === "comments" && window.location.pathname.includes("view") ? "comments" : "posts")
  console.log("Collection", collection());
  let [postData, setPostData] = createSignal<any>({
    content: "",
    links: [],
    tags: [],
    author: JSON.parse(localStorage.getItem("postr_auth") || "{}").id,
    isRepost: false,
    isPoll: false,
    repost: "",
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

  console.log(postData())



  async function createPost() {
    if (isPosting()) return;
    setIsPosting(true);
    setHasError(false);


    const data = { ...postData() };
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
        data.post = parts[3];
        if (!window.location.pathname.includes("posts")) {
          data.mainComment = parts[3];
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
          `/u/user_${api.authStore.model.username}/comments`
        ],
      }) as any;

      setPostData({
        content: "", links: [], tags: [],
        isRepost: false, isPoll: false,
        hashtags: [], whoCanSee: "public",
        _preview_meta: null, embedded_link: null,
      });
      setFiles([]);
      setIsPosting(false);

      if (collection() === "comments") {
        document.getElementById("createPostModal")?.close();
        window.dispatchEvent(new CustomEvent("commentCreated", { detail: res }));

        const postId = window.location.pathname.split("/")[3];
        const p = await api.collection("posts").get(postId);
        await api.collection("posts").update(postId, {
          comments: [...(p.comments || []), res.id]
        });
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


  const postMessages = [
    "We’re creating your post. This might take a few seconds if you added images or videos.",
    "Compressing media and optimizing your content...",
    "Uploading... almost there!",
    "Hang tight! Wrapping up your post creation.",
    "Finalizing your post. We’ll be done shortly.",
  ];

  const [currentMessage, setCurrentMessage] = createSignal(postMessages[0]);

  onMount(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * postMessages.length);
      setCurrentMessage(postMessages[randomIndex]);
    }, 3000); // Change every 3 seconds

    onCleanup(() => clearInterval(interval));
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
    setCollection(window.location.pathname.split("/")[2] === "posts" ? "comments" : "posts");
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
            theme() == "dark" ? "bg-base-300 text-white"  : "bg-white"
          )}>
            <div class="flex flex-row  h-full justify-between  ">
              <button
                class="btn btn-sm focus:outline-none btn-circle btn-ghost  "
                onClick={() => document.getElementById("createPostModal")?.close()}
              >
                ✕
              </button>
              <p class="text-blue-500 btn btn-sm rounded-full">Drafts</p>
            </div>
            <div class={joinClass("flex flex-row h-full text-lg mt-5",
               postData().content.length > 20 ? "h-[25rem]" : ""
            )}>
              <img
                src={api.cdn.getUrl(
                  "users",
                  api.authStore.model.id,
                  api.authStore.model.avatar
                )}
                class="w-10 h-10 rounded"
                alt="logo"
              />
              <div class="flex flex-col h-full gap-2  ">
                <textarea
                  value={postData().content}
                  maxLength={400}
                  class={joinClass(
                    "    bg-transparent  w-full rounded-lg mx-5  outline-none scroll", 
                    postData().content.length > 20 ? "h-[34rem]" : ""
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
                  disabled={(canCommentOnPost() && replyRule() == "public") == false ||
                      (!canCommentOnPost() &&
                        mainPost() &&
                        mainPost().expand &&
                        mainPost().author &&
                        mainPost().author !== api.authStore.model.id)}
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
              <button class="btn-sm bg-blue-500 text-white rounded-full  " onClick={()=>{
                if(replyRule() == "private") return;
                createPost()
              }}>
                {isPosting() ? "Posting..." : collection() === "posts" ? "Post" : replyRule() == "private" ? "Author Set Comments Private":"Create Comment"}
              </button>
            </div>
          </div>
        </Match>
        <Match when={hasError()}>
          <div class="modal-box  p-2 z-[-1] h-fit">
            <div class="flex flex-row justify-between  ">
              <button
                class="btn btn-sm focus:outline-none btn-circle btn-ghost  "
                onClick={() => document.getElementById("createPostModal")?.close()}
              >
                ✕
              </button>
              <p class="text-blue-500 btn btn-sm rounded-full">Drafts</p>
            </div>
            <div class="flex flex-row  text-lg mt-5">
              <Switch>
                <Match when={api.authStore.model.avatar}>
                  <img
                    src={api.cdn.getUrl(
                      "users",
                      api.authStore.model.id,
                      api.authStore.model.avatar
                    )}
                    class="w-10 h-10 rounded"
                    alt="logo"
                  />
                </Match>
                <Match when={!api.authStore.model.avatar.length > 0}>
                  <div class="rounded-full w-12 h-12    bg-base-200 text-white flex items-center justify-center">
                    <p class={theme() == "dark" ? "text-white" : "text-black"}>{api.authStore.model.username[0]}</p>
                  </div>
                </Match>
              </Switch>
              <div class="flex flex-col gap-2">
                <textarea
                  maxLength={400}
                  class={joinClass(
                    "w-full h-fit  rounded-lg mx-5 resize-none outline-none scroll",
                    theme() === "dark" ? "bg-black text-white" : "bg-white"
                  )}
                  placeholder={`Error Occured :/`}
                  disabled={true}
                ></textarea>

                <Show when={postData().isRepost}>
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
