import { createSignal, For, createEffect } from "solid-js";
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
function getFileType(file: File): "image" | "video" | "unknown" {
  if (file.type.startsWith("image/")) {
    return "image";
  } else if (file.type.startsWith("video/")) {
    return "video";
  } else {
    return "unknown";
  }
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
  let [hasError, setHasError] = createSignal(false, {equals: false})
  let [error, setError] = createSignal(null)
  const [collection, setCollection] = createSignal(window.location.pathname.split("/")[2] === "posts" && window.location.pathname.includes("view") ? "comments" : window.location.pathname.split("/")[2] === "comments" &&  window.location.pathname.includes("view") ? "comments" : "posts") 
  console.log("Collection", collection());
  let [postData, setPostData] = createSignal<any>({
    content: "",
    links: [],
    tags: [],
    author: api.authStore.model.id,
    isRepost: false,
    isPoll: false, 
    whoCanSee: "public",
  });

  let [Drafts, setDrafts] = createSignal(
    localStorage.getItem("postDrafts") ? JSON.parse(localStorage.getItem("drafts") as any) : [] 
  )

  console.log(postData())
 

  async function createPost() {
    if(isPosting()) return;
    setIsPosting(true);  
    let data = postData(); 
    if(files().length > 0) {
       let filesData = files().map((file: any) => {
        let fileObj = {
          name: file.name,
          type: file.type,
          size: file.size,
        }
        if(getFileType(file) == "video"){
         data.isSnippet = true
        }
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        return new Promise((resolve, reject) => {
           /**
            * if(fileObj.size >  5242880) { // 
            alert("File size wayy to big please compress or try a different file!")
            reject("File way too big")
          }
            */
          reader.onload = () => {
            resolve({ data: Array.from(new Uint8Array(reader.result as ArrayBuffer)), ...fileObj });
          };
        });
      });
      filesData = await Promise.all(filesData);
      data.files = filesData;
    } 
     try {

      console.log(collection())
      
      collection() === "comments" && (data.post = window.location.pathname.split("/")[3]);
      collection() === "comments" && !window.location.pathname.includes("posts") &&  (data.mainComment = window.location.pathname.split("/")[3]) 
      let res = await api.collection(collection()).create(data, {
        expand: [
          "author",
          "author.following",
          "author.followers",
          "author.TypeOfContentPosted",
          "likes",
          "repost.likes",
          "repost.author",
          "repost"
        ],
        invalidateCache: [`/u/${api.authStore.model.username}_posts`, `/u/${api.authStore.model.username}/comments`],
      })  
      setPostData({
        content: "",
        links: [],
        tags: [],
        isRepost: false,
        isPoll: false, 
        hashtags: [], 
        whoCanSee: "public", 
      });
      setFiles([]);
      setIsPosting(false); 
      if( collection() === "comments") {
        document.getElementById("createPostModal")?.close();
        window.dispatchEvent(
          new CustomEvent("commentCreated", {
            detail: res,
          })
        );
        // update the post in db
        const postId = window.location.pathname.split("/")[3];  
        var p = await api.collection(collection() == "comments" ? "posts" : "comments").get(postId)
        await api.collection(p.collectionName).update(postId,{
           ...({comments: [...(p.comments || []), (res as any).id]}) 
        });
      }else{
        setTimeout(()=>{
          navigate(`/view/posts/${(res as any).id}`);
        }, 100)
      }
      
     } catch (error) { 
      setHasError(true) 
      setIsPosting(false);
      setError(error.message)
      console.log("Error", error);
     } 
  }

 
  //@ts-ignore
  window.setParams = (params: any) => {
    setParams(params);
  };

  //@ts-ignore
  window.repost = (post: any) => {
    setPostData({ ...postData(), isRepost: true, repost: post , hidden: ["repostButton"]});
  }
  //@ts-ignore
  window.resetCreatePost = () => {  
    setCollection(window.location.pathname.split("/")[2] === "posts" ?  "comments" : "posts"); 
  }

  //@ts-ignore
  window.setWhoCanReply = (rule) =>{
      if(rule == "private"){
        setCanCommentOnPost(false)
        setReplyRule(rule)
      }
  }

  //@ts-ignore
  window.setMainPost = (data) => {
    setMainPost(data)
  }
 
  return (
    <dialog id="createPostModal" class="modal z-[-1f]">
       <Switch>
        <Match when={isPosting() && !hasError()}>
          <div class="modal-box scroll p-2 z-[-1] h-fit">
          <p>Wait one second creating your post!</p>
          <div class="spinner spinner-lg"></div>
          </div>
        </Match>
        <Match when={!isPosting() && !hasError()}>
          <div class="modal-box scroll p-2 z-[-1] h-fit">
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
          <img
            src={api.cdn.getUrl(
              "users",
              api.authStore.model.id,
              api.authStore.model.avatar
            )}
            class="w-10 h-10 rounded"
            alt="logo"
          />
          <div class="flex flex-col gap-2 w-full">
          <textarea
            maxLength={200}
            class={joinClass(
              "w-full h-fit  rounded-lg mx-5 resize-none outline-none scroll",
              theme() === "dark" ? "bg-black text-white" : "bg-white"
            )}
            placeholder={canCommentOnPost() && replyRule() == "public" || !canCommentOnPost() && mainPost() && mainPost()?.expand.author.id == api.authStore.model.id ? "What is on your mind?" : "Post replies are restricted, only the author can reply"}
            disabled={!canCommentOnPost()}
            onInput={(e: any) => {
              setPostData({ ...postData(), content: e.target.value });
            }}
          ></textarea>

          <Show when={postData().isRepost}>
            <Post {...postData().repost} />
          </Show>
          </div>
        </div>
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
                       <video src={URL.createObjectURL(file)} autoplay loop  class="w-full h-[20rem] object-cover rounded-lg my-2"  alt="file"/>
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
            <NumberedList
              class={joinClass(
                "w-5 h-5 cursor-pointer",
                files().length > 0 && "opacity-50",
                postData().isPoll && "text-blue-500"
              )}
              onClick={() =>
              {
                if(postData().isPoll)  setPostData({ ...postData(), isPoll: false });
                else  setPostData({ ...postData(), isPoll: true })
              }
              }
            />
          </div>
          {/**
           * verticle line
           */}
          <span>{postData().content.length} / 200</span>
          <button class="btn-sm bg-blue-500 text-white rounded-full  " onClick={createPost}>
            {isPosting() ? "Posting..." : collection() === "posts" ? "Post" : "Create Comment"}
          </button>
        </div>
      </div>
        </Match>
        <Match when={hasError()}>
       <div class="modal-box scroll p-2 z-[-1] h-fit">
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
          <img
            src={api.cdn.getUrl(
              "users",
              api.authStore.model.id,
              api.authStore.model.avatar
            )}
            class="w-10 h-10 rounded"
            alt="logo"
          />
          <div class="flex flex-col gap-2 w-full">
          <textarea
            maxLength={200}
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
                       <video src={URL.createObjectURL(file)} autoplay loop  class="w-full h-[20rem] object-cover rounded-lg my-2"  alt="file"/>
                    </Match>
                   </Switch> 
                </Carousel.Item>
              )}
            </For>
          </Carousel>
        </Show>
        <Show when ={postData().isPoll}>
          <div class="flex flex-col gap-2">
            <input
              type="date"
              class="input input-bordered rounded-lg"
              max={getMaxDate()}
              onInput={(e: any) =>
                setPostData({ ...postData(), pollEnds: e.target.value })
              }
            />
            <For each={postData().pollOptions}>
              {(option: any) => (
                <div class="flex flex-row gap-2">
                  <input
                    type="text"
                    class="input input-bordered rounded-lg"
                    placeholder="Option"
                    value={option.content}
                    onChange={(e: any) =>
                      setPostData({
                        ...postData(),
                        pollOptions: postData().pollOptions.map((o: any) =>
                          o.choice === option.choice
                            ? { ...o, content: e.target.value }
                            : o
                        ),
                      })
                    }
                  />
                  <button
                    class="btn btn-circle btn-ghost"
                    onClick={() =>
                      setPostData({
                        ...postData(),
                        pollOptions: postData().pollOptions.filter(
                          (o: any) => o.choice !== option.choice
                        ),
                      })
                    }
                  >
                    ✕
                  </button>
                </div>
              )}
            </For>
            <button
              class="btn btn-sm bg-blue-500 text-white rounded-full"
              onClick={() =>
                setPostData({
                  ...postData(),
                  pollOptions: [
                    ...postData().pollOptions,
                    {
                      choice: postData().pollOptions.length + 1,
                      content: "",
                    },
                  ],
                })
              }
            >
              Add option
            </button>
          </div>
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
