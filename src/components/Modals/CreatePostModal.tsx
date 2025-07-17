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
    case "biology":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-120v-80h200v-80q-83 0-141.5-58.5T200-480q0-61 33.5-111t90.5-73q8-34 35.5-55t62.5-21l-22-62 38-14-14-36 76-28 12 38 38-14 110 300-38 14 14 38-76 28-12-38-38 14-24-66q-15 14-34.5 21t-39.5 5q-22-2-41-13.5T338-582q-27 16-42.5 43T280-480q0 50 35 85t85 35h320v80H520v80h240v80H200Zm346-458 36-14-68-188-38 14 70 188Zm-126-22q17 0 28.5-11.5T460-640q0-17-11.5-28.5T420-680q-17 0-28.5 11.5T380-640q0 17 11.5 28.5T420-600Zm126 22Zm-126-62Zm0 0Z" /></svg>
      )
    case "technology":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
        </svg>
      )
    case "engineering":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M42-120v-112q0-33 17-62t47-44q51-26 115-44t141-18q77 0 141 18t115 44q30 15 47 44t17 62v112H42Zm80-80h480v-32q0-11-5.5-20T582-266q-36-18-92.5-36T362-320q-71 0-127.5 18T142-266q-9 5-14.5 14t-5.5 20v32Zm240-240q-66 0-113-47t-47-113h-10q-9 0-14.5-5.5T172-620q0-9 5.5-14.5T192-640h10q0-45 22-81t58-57v38q0 9 5.5 14.5T302-720q9 0 14.5-5.5T322-740v-54q9-3 19-4.5t21-1.5q11 0 21 1.5t19 4.5v54q0 9 5.5 14.5T422-720q9 0 14.5-5.5T442-740v-38q36 21 58 57t22 81h10q9 0 14.5 5.5T552-620q0 9-5.5 14.5T532-600h-10q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T442-600H282q0 33 23.5 56.5T362-520Zm300 160-6-30q-6-2-11.5-4.5T634-402l-28 10-20-36 22-20v-24l-22-20 20-36 28 10q4-4 10-7t12-5l6-30h40l6 30q6 2 12 5t10 7l28-10 20 36-22 20v24l22 20-20 36-28-10q-5 5-10.5 7.5T708-390l-6 30h-40Zm20-70q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm72-130-8-42q-9-3-16.5-7.5T716-620l-42 14-28-48 34-30q-2-5-2-8v-16q0-3 2-8l-34-30 28-48 42 14q6-6 13.5-10.5T746-798l8-42h56l8 42q9 3 16.5 7.5T848-780l42-14 28 48-34 30q2 5 2 8v16q0 3-2 8l34 30-28 48-42-14q-6 6-13.5 10.5T818-602l-8 42h-56Zm28-90q21 0 35.5-14.5T832-700q0-21-14.5-35.5T782-750q-21 0-35.5 14.5T732-700q0 21 14.5 35.5T782-650ZM362-200Z" /></svg>
      )
    case "science":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-120q-51 0-72.5-45.5T138-250l222-270v-240h-40q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760h-40v240l222 270q32 39 10.5 84.5T760-120H200Zm0-80h560L520-492v-268h-80v268L200-200Zm280-280Z" /></svg>
      )
    case "gaming":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m272-440 208 120 208-120-168-97v137h-80v-137l-168 97Zm168-189v-17q-44-13-72-49.5T340-780q0-58 41-99t99-41q58 0 99 41t41 99q0 48-28 84.5T520-646v17l280 161q19 11 29.5 29.5T840-398v76q0 22-10.5 40.5T800-252L520-91q-19 11-40 11t-40-11L160-252q-19-11-29.5-29.5T120-322v-76q0-22 10.5-40.5T160-468l280-161Zm0 378L200-389v67l280 162 280-162v-67L520-251q-19 11-40 11t-40-11Zm40-469q25 0 42.5-17.5T540-780q0-25-17.5-42.5T480-840q-25 0-42.5 17.5T420-780q0 25 17.5 42.5T480-720Zm0 560Z" /></svg>
      )
    case "software":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z" /></svg>
      )
    case "cooking":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M360-120v-120H80v-80h280q33 0 56.5 23.5T440-240v120h-80Zm160 0v-120q0-33 23.5-56.5T600-320h280v80H600v120h-80ZM240-360q-50 0-85-35t-35-85v-160h720v160q0 50-35 85t-85 35H240Zm0-80h480q17 0 28.5-11.5T760-480v-80H200v80q0 17 11.5 28.5T240-440ZM120-680v-80h240v-40q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800v40h240v80H120Zm80 240v-120 120Z" /></svg>
      )
    case "anime":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m440-803-83 83H240v117l-83 83 83 83v117h117l83 83 100-100 168 85-86-167 101-101-83-83v-117H523l-83-83Zm0-113 116 116h164v164l116 116-116 116 115 226q7 13 4 25.5T828-132q-8 8-20.5 11t-25.5-4L556-240 440-124 324-240H160v-164L44-520l116-116v-164h164l116-116Zm0 396Z" /></svg>
      )
    case "health":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" /></svg>
      )
    case "art":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-80q-33 0-56.5-23.5T80-160v-480q0-33 23.5-56.5T160-720h160l160-160 160 160h160q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H160Zm0-80h640v-480H160v480Zm80-80h480L570-440 450-280l-90-120-120 160Zm460-200q25 0 42.5-17.5T760-500q0-25-17.5-42.5T700-560q-25 0-42.5 17.5T640-500q0 25 17.5 42.5T700-440ZM404-720h152l-76-76-76 76ZM160-160v-480 480Z" /></svg>
      )
    case "sports":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M440-200q-100 0-170-70t-70-170q0-11 1-22t3-22q-5 2-12 3t-12 1q-42 0-71-29t-29-71q0-42 27.5-71t69.5-29q33 0 59.5 18.5T274-614q33-30 75.5-48t90.5-18h440v160H680v80q0 100-70 170t-170 70ZM180-540q17 0 28.5-11.5T220-580q0-17-11.5-28.5T180-620q-17 0-28.5 11.5T140-580q0 17 11.5 28.5T180-540Zm260 240q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41Zm0-60q33 0 56.5-23.5T520-440q0-33-23.5-56.5T440-520q-33 0-56.5 23.5T360-440q0 33 23.5 56.5T440-360Zm0-80Z" /></svg>
      )
    case "business":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm240-600h160v-80H400v80Zm400 360H600v80H360v-80H160v160h640v-160Zm-360 0h80v-80h-80v80Zm-280-80h200v-80h240v80h200v-200H160v200Zm320 40Z" /></svg>
      )
    case "entertainment":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m233-80 54-122q-14-11-27-21.5T235-246q-8 3-15.5 4.5T203-240q-33 0-56.5-23.5T123-320q0-20 8.5-36.5T155-384q-8-23-11-46.5t-3-49.5q0-26 3-49.5t11-46.5q-15-11-23.5-27.5T123-640q0-33 23.5-56.5T203-720q9 0 16.5 1.5T235-714q33-36 75.5-60t90.5-36q5-30 27.5-50t52.5-20q30 0 52.5 20.5T561-810q48 12 90.5 35.5T727-716q8-3 15-4.5t15-1.5q33 0 56.5 23.5T837-642q0 20-8 35.5T807-580q8 24 11 49t3 51q0 26-3 50.5T807-382q14 11 22 26.5t8 35.5q0 33-23.5 56.5T757-240q-8 0-15-1.5t-15-4.5q-12 12-24.5 23.5T675-200l52 120h-74l-38-88q-14 6-27 10.5t-27 7.5q-5 29-27.5 49.5T481-80q-30 0-52.5-20T401-150q-15-3-28.5-7.5T345-168l-38 88h-74Zm76-174 62-140q-14-18-22-40t-8-46q0-57 41.5-98.5T481-620q57 0 98.5 41.5T621-480q0 24-8.5 47T589-392l62 138q9-8 17.5-14.5T685-284q-5-8-6.5-17.5T677-320q0-32 22-55t54-25q6-20 9-39.5t3-40.5q0-21-3-41.5t-9-40.5q-32-2-54-25t-22-55q0-9 2.5-17.5T685-676q-29-29-64-49t-74-31q-11 17-28 26.5t-38 9.5q-21 0-38-9.5T415-756q-41 11-76 31.5T275-674q3 8 5.5 16.5T283-640q0 32-21 54.5T209-560q-6 20-9 39.5t-3 40.5q0 21 3 40.5t9 39.5q32 2 53 25t21 55q0 9-1.5 17.5T275-286q8 9 16.5 16.5T309-254Zm60 34q11 5 22.5 9t23.5 7q11-17 28-26.5t38-9.5q21 0 38 9.5t28 26.5q12-3 22.5-7t21.5-9l-58-130q-12 5-25 7.5t-27 2.5q-15 0-28.5-3t-25.5-9l-58 132Zm112-200q24 0 42-17t18-43q0-24-18-42t-42-18q-26 0-43 18t-17 42q0 26 17 43t43 17Zm0-60Z" /></svg>
      )
    case "politics":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M160-120v-80h480v80H160Zm226-194L160-540l84-86 228 226-86 86Zm254-254L414-796l86-84 226 226-86 86Zm184 408L302-682l56-56 522 522-56 56Z" /></svg>
      )
    case "music":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" /></svg>
      )
    case "education":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M300-80q-58 0-99-41t-41-99v-520q0-58 41-99t99-41h500v600q-25 0-42.5 17.5T740-220q0 25 17.5 42.5T800-160v80H300Zm-60-267q14-7 29-10t31-3h20v-440h-20q-25 0-42.5 17.5T240-740v393Zm160-13h320v-440H400v440Zm-160 13v-453 453Zm60 187h373q-6-14-9.5-28.5T660-220q0-16 3-31t10-29H300q-26 0-43 17.5T240-220q0 26 17 43t43 17Z" /></svg>
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
                class="modal sm:modal-bottom rounded-xl xl:modal-middle md:modal-middle  "
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
              <dialog id="topicPicker" class="modal sm:modal-bottom rounded-xl xl:modal-middle md:modal-middle">
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
