import { createSignal, For, createEffect, onMount, onCleanup, Show, Switch, Match } from "solid-js";
import { Portal } from "solid-js/web";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { api } from "@/src";
import { joinClass } from "@/src/Utils/Joinclass";
import Post from "../PostRelated/Post";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import { getFileType, prepareFile } from "@/src/Utils/BetterHandling";
import { dispatchAlert } from "@/src/Utils/SDK";
import { GeneralTypes } from "@/src/Utils/SDK/Types/GeneralTypes";

 
function extractFirstURL(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches[0] : null;
}

// --- Animation CSS (Tailwind + inline keyframes) ---
const globalStyles = `
@keyframes fadeIn {from{opacity:0;transform:scale(.98);}to{opacity:1;transform:scale(1);}}
@keyframes slideUp {from{opacity:0;transform:translateY(15px);}to{opacity:1;transform:translateY(0);}}
.animate-fadeIn{animation:fadeIn .25s ease-out;}
.animate-slideUp{animation:slideUp .25s ease-out;}
`;
/** === UNIVERSAL ICONS FOR CREATEPOSTMODAL === **/

export const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 0 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
  </svg>
);

export const MediaIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm2 0v14h14V5H5zm2 3l2.5 3.5L12 8.5l4.5 6H7l2-3z" />
  </svg>
);

export const GifIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M19 10.5V8.8h-4.4v6.4h1.7v-2h2v-1.7h-2v-1H19zm-7.3-1.7h1.7v6.4h-1.7V8.8zm-3.6 1.6c.4 0 .9.2 1.2.5l1.2-1C9.9 9.2 9 8.8 8.1 8.8c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2c1 0 1.8-.4 2.4-1.1v-2.5H7.7v1.2h1.2v.6c-.2.1-.5.2-.8.2-.9 0-1.6-.7-1.6-1.6 0-.8.7-1.6 1.6-1.6z" />
  </svg>
);

export const PollIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20.222 9.16h-1.334c.015-.09.028-.182.028-.277V6.57c0-.98-.797-1.777-1.778-1.777H3.5V3.358c0-.414-.336-.75-.75-.75s-.75.336-.75.75V20.83c0 .414.336.75.75.75s.75-.336.75-.75v-1.434h10.556c.98 0 1.778-.797 1.778-1.777v-2.313c0-.095-.013-.187-.028-.277h4.417c.98 0 1.778-.797 1.778-1.778v-2.31c0-.983-.797-1.78-1.778-1.78zM17.14 6.293c.152 0 .277.124.277.277v2.31c0 .154-.125.28-.278.28H3.472V6.29H17.14zm-2.807 9.014v2.312c0 .153-.125.277-.278.277H3.472v-2.866H14.61c.153 0 .277.125.277.277zm5.695-7.890c.153 0 .277.126.277.28v2.31c0 .154-.124.28-.277.28H3.472V7.403h16.556z" />
  </svg>
);

export const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
    <circle cx="8.5" cy="10.5" r="1.5" />
    <circle cx="15.5" cy="10.5" r="1.5" />
    <path d="M12 18c2.28 0 4.22-1.66 5-4H7c.78 2.34 2.72 4 5 4z" />
  </svg>
);

export const ScheduleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

export const LocationIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export const WorldIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

export const UsersIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.01 3.01 0 0 0 17.1 6H16c-.8 0-1.54.37-2.03.99L12 9l-1.97-2.01A2.99 2.99 0 0 0 8 6H6.9c-1.3 0-2.4.84-2.86 2.37L1.5 16H4v6h4v-6h2v6h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5z" />
  </svg>
);

export const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export const HashtagIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
  </svg>
);

export default function CreatePostModal() {
  const { theme } = useTheme();
  const { navigate } = useNavigation();

  const [isPosting, setIsPosting] = createSignal(false);
  const [files, setFiles] = createSignal<File[]>([], { equals: false });
  const [hasError, setHasError] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [topics, setTopics] = createSignal<any[]>([]);
  const [showGifPicker, setShowGifPicker] = createSignal(false);
  const [showEmojiPicker, setShowEmojiPicker] = createSignal(false);
  let contentInputRef: HTMLTextAreaElement;
  let emojiButtonRef: HTMLButtonElement;
  let emojiDropdownRef: HTMLDivElement;
 const EMOJIS = [
  "😀","😃","😄","😁","😆","😂","🤣","😊","😍","😘","😎","🤓",
  "🙌","🎉","❤️","🔥","✨","👍","👀","🧠","💡","🚀","🥳","😅",
  "🤯","😇","🙏","😢","🥺","🤗","😉","😌","😴","🤤","😤","😡","🤬",
  
  // More Smileys & Emotion
  "🙂","🙃","😏","😒","😞","😔","😕","☹️","😣","😖","😩","😫","😭",
  "😳","🥵","🥶","😱","😨","😰","😥","😪","😓","🤒","🤕","🤢","🤮",
  "🤧","😇","🤠","🥸","😈","👿","💀","☠️","🤡","👻","👽","🤖",
  
  // Hands & Gestures
  "👏","🤝","✌️","👌","🤌","🤏","🤘","🤙","🫶","🤲","👐","✋","🖐️",
  "🙏","🤜","🤛","💪","🫴","🫱","🫲",
  
  // Hearts & Symbols
  "💖","💗","💓","💞","💕","💘","💝","💟","💔","💙","💚","💛","💜","🖤","🤍","🤎",
  "💯","💢","💥","💫","💦","💨","🕊️",

  // Animals
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸",
  "🐵","🐔","🐧","🐦","🦅","🦆","🦉","🦇",
  "🐢","🐍","🦖","🦕","🐙","🦑","🦐","🦞","🐡","🐠","🐳","🐬",
  
  // Food & Drinks
  "🍏","🍎","🍐","🍊","🍋","🍉","🍇","🍓","🫐","🍒","🍑","🥭",
  "🍍","🥥","🥝","🍅","🥑","🍆","🥦","🥕","🌽","🥔","🍞","🥐","🥯",
  "🍕","🍔","🍟","🌭","🌮","🌯","🥗","🍣","🍤","🍜","🍝","🥡",
  "🍪","🍩","🍰","🧁","🍫","🍿","🍬","🍭",
  "🥤","🧋","☕","🍵","🍺","🍻","🥂","🍷","🍸","🍹",
  
  // Travel & Locations
  "🌍","🌎","🌏","🗺️","🏔️","🏝️","🏜️","🌋","🏞️",
  "🏙️","🏡","🏠","🛖","🕌","⛩️","🏰","🗽","🗼",
  "✈️","🚁","🚀","🛸","🚗","🚙","🛻","🚚","🚛","🏎️",
  "🚲","🛵","🏍️","🛴","🚌","🚎","🚂","🚆","🚇","⛵","🚤","🛥️",
  
  // Weather & Nature
  "☀️","🌤️","⛅","🌥️","🌦️","🌧️","⛈️","🌩️","❄️","☃️","🌬️","🌪️",
  "🌈","🌊","🔥","🌋","🌙","⭐","🌟","✨","☄️",
  
  // Objects
  "💻","🖥️","⌨️","🖱️","💽","💾","📱","📲","📞","☎️",
  "🎧","🎤","📷","📸","📹","🎥",
  "💡","🔦","🕯️","📦","📌","📍","📎","🖊️","🖋️","✏️","📝",
  
  // Money & Work
  "💰","💸","💵","💴","💶","💷","🪙","💳","🏦",
  "📈","📉","📊","🧾","🗂️","📁","📝","🗃️",
  
  // Fantasy & Fun
  "🐉","🦄","🧚‍♂️","🧜‍♀️","🧞‍♂️","🧙‍♂️","🧝‍♂️",
  "⚔️","🛡️","🪄","🔮","🧸",
  
  // Activities
  "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🥏","🏓","🏸",
  "🥊","🥋","🎱","🎳","🎮","🕹️","♟️",
  "🎨","🖌️","🧵","🎹","🎸","🥁","🎺","🎻",
  "🎬","📚","📖","📰","🧩","🎯",
  
  // Flags (popular)
  "🇺🇸","🇨🇦","🇬🇧","🇯🇵","🇰🇷","🇲🇽","🇧🇷","🇫🇷","🇩🇪","🇮🇳",
  
  // More reactions
  "😐","😑","😶","😮","😲","🤐","😬","😮‍💨","🥱",
  "😵","😵‍💫","🤠","😺","😸","😹",
  
  // Extra fun/random
  "🛑","⚠️","❗","❓","🔔","🔕","🔒","🔓","🔑",
  "🎁","🎀","🎊","🎎","🎏","🎐","🪅","🪩","🎈",
  "🛒","💍","💎","🕶️","🎒","⌚","⏰","📡","🧭"
];

  function insertEmoji(emoji: string) {
    const content = postData().content || "";
    if (contentInputRef) {
      const start = contentInputRef.selectionStart ?? content.length;
      const end = contentInputRef.selectionEnd ?? content.length;
      const next = content.slice(0, start) + emoji + content.slice(end);
      setPostData({ ...postData(), content: next });
      queueMicrotask(() => {
        contentInputRef.focus();
        const caret = start + emoji.length;
        contentInputRef.selectionStart = caret;
        contentInputRef.selectionEnd = caret;
      });
    } else {
      setPostData({ ...postData(), content: content + emoji });
    }
  }
  const [gifSearchQuery, setGifSearchQuery] = createSignal("");
  const [gifs, setGifs] = createSignal<any[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = createSignal(false);
  const [replyRule, setReplyRule] = createSignal("public");
  const [mainPost, setMainPost] = createSignal<any>(null);
  const [canCommentOnPost, setCanCommentOnPost] = createSignal(true);
  const [collection, setCollection] = createSignal("posts");
  const [postData, setPostData] = createSignal<any>({
    content: "",
    links: [],
    tags: [],
    author: JSON.parse(localStorage.getItem("postr_auth") || "{}").id,
    isRepost: false,
    isPoll: false,
    topic: null,
    whoCanSee: "public",
    embedded_link: null,
    _preview_meta: null,
  });

  // --- Link Preview Effect ---
  createEffect(() => {
    const content = postData().content;
    const url = extractFirstURL(content);
    if (!url || url === postData().embedded_link) return;

    setPostData((prev) => ({ ...prev, embedded_link: url, _preview_meta: null }));
    fetch(`${api.serverURL}/opengraph/embed?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((meta) =>
        setPostData((p) => ({ ...p, _preview_meta: meta, content: p.content.replace(url, "").trim() }))
      )
      .catch(() =>
        setPostData((p) => ({ ...p, _preview_meta: null, content: p.content.replace(url, "").trim() }))
      );
  });

  // --- Post Creation ---
  async function createPost() {
    if (isPosting()) return;
    setIsPosting(true);
    setHasError(false);
    const data = { ...postData(), author: JSON.parse(localStorage.getItem("postr_auth") || "{}").id };
    if (!data.author) return dispatchAlert({ type: "error", message: "Missing author" });

    try {
      if (files().length > 0) data.files = await Promise.all(files().map((f) => prepareFile(f)));
     const res = await api.collection(collection()).create(data, {
        invalidateCache: [`/u/${data.author}_posts`],
      });
      setIsPosting(false);
      setFiles([]);
      setPostData({ ...postData(), content: "" });
      dispatchAlert({ type: "success", message: "Your post is live 🚀" });
      navigate(`/view/posts/${res.id}`);
    } catch (err: any) {
      setIsPosting(false);
      setHasError(true);
      setError(err.message || "Unknown error");
    }
  }

  onMount(async () => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!showEmojiPicker()) return;
      if (emojiDropdownRef && emojiDropdownRef.contains(target)) return;
      if (emojiButtonRef && emojiButtonRef.contains(target)) return;
      setShowEmojiPicker(false);
    };
    document.addEventListener("click", handleDocClick);
    onCleanup(() => document.removeEventListener("click", handleDocClick));
  });

  function closeAndReset() {
    setFiles([]);
    setShowGifPicker(false);
    setShowEmojiPicker(false);
    setPostData({
      ...postData(),
      content: "",
      topic: null,
      isRepost: false,
      _preview_meta: null,
      embedded_link: null,
    });
    document.getElementById("createPostModal")?.close();
  }

  return (
    <>
      <style>{globalStyles}</style>
      <dialog
        id="createPostModal"
        class="modal open:scale-100 open:opacity-100 scale-95 opacity-0 transition-all duration-300 ease-out backdrop-blur-md"
      >
        <Switch>
          {/* --- Posting Screen --- */}
          <Match when={isPosting() && !hasError()}>
            <div class="modal-box w-full max-w-2xl bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl animate-fadeIn">
              <div class="flex flex-col items-center justify-center py-16">
                <div class="relative w-10 h-10">
                  <div class="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
                  <div class="absolute inset-0 rounded-full border-4 border-blue-200/40"></div>
                </div>
                <h2 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Publishing...</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Hang tight! Finalizing your post.</p>
              </div>
            </div>
          </Match>

          {/* --- Main Post Editor --- */}
          <Match when={!isPosting() && !hasError()}>
            <div class="modal-box w-full max-w-2xl mx-auto bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border-0 p-0 animate-fadeIn">
              {/* Header */}
              <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5">
                <button onClick={closeAndReset} class="p-2 rounded-full hover:bg-blue-100/40 dark:hover:bg-blue-900/20">
                  <CloseIcon />
                </button>
                <button class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold">Drafts</button>
              </div>

              {/* Content */}
              <div class="p-5 overflow-y-auto max-h-[80vh] space-y-4">
                <div class="flex items-start space-x-3">
                  <img
                    src={
                      api.authStore.model?.avatar
                        ? api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar)
                        : "/icons/usernotfound/image.png"
                    }
                    class="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/10"
                  />
                  <div class="flex-1">
                    <textarea
                      value={postData().content}
                      maxLength={400}
                      placeholder="Share something interesting..."
                      class="w-full bg-transparent text-lg sm:text-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none transition-all focus:scale-[1.01]"
                      ref={contentInputRef}
                      onInput={(e: any) => {
                        setPostData({ ...postData(), content: e.target.value });
                        e.target.style.height = "auto";
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                      }}
                      style={{ "min-height": "60px" }}
                    />
                  </div>
                </div>

                {/* Link Preview */}
                <Show when={postData()._preview_meta}>
                  <a
                    href={postData().embedded_link}
                    target="_blank"
                    class="block border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <img src={postData()._preview_meta?.image} class="w-full h-48 object-cover" />
                    <div class="p-3">
                      <p class="font-semibold text-gray-900 dark:text-white">{postData()._preview_meta?.title}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {postData()._preview_meta?.description}
                      </p>
                    </div>
                  </a>
                </Show>

                {/* File Preview */}
                <Show when={files().length > 0}>
                  <div class="grid grid-cols-2 gap-2">
                    <For each={files()}>
                      {(file) => (
                        <div class="relative group overflow-hidden rounded-2xl hover:scale-[1.02] hover:shadow-lg transition-all">
                          <Switch>
                            <Match when={getFileType(file) === "image"}>
                              <img src={URL.createObjectURL(file)} class="w-full h-32 object-cover" />
                            </Match>
                            <Match when={getFileType(file) === "video"}>
                              <video src={URL.createObjectURL(file)} class="w-full h-32 object-cover" autoplay loop muted />
                            </Match>
                          </Switch>
                          <button
                            onClick={() => setFiles(files().filter((f) => f.name !== file.name))}
                            class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* Footer Toolbar */}
              <div class="relative flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm rounded-b-2xl">
                <div class="flex items-center space-x-3">
                  <input type="file" hidden id="files" multiple accept="image/*,video/*" onInput={(e: any) => setFiles([...e.target.files])} />
                  <button onClick={() => document.getElementById("files")?.click()} class="p-2 rounded-full hover:scale-110 transition-transform text-blue-500">
                    <MediaIcon />
                  </button>
                  <button onClick={() => setShowGifPicker(!showGifPicker())} class="p-2 rounded-full hover:scale-110 transition-transform text-blue-500">
                    <GifIcon />
                  </button>
                  <button ref={emojiButtonRef} onClick={() => setShowEmojiPicker(!showEmojiPicker())} class="p-2 rounded-full hover:scale-110 transition-transform text-blue-500">
                    <EmojiIcon />
                  </button>
                  <Show when={showEmojiPicker()}>
                    <div ref={emojiDropdownRef} class="absolute bottom-14 left-5 z-50 w-64 max-h-56 overflow-y-auto p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-xl animate-slideUp">
                      <div class="grid grid-cols-8 gap-2">
                        <For each={EMOJIS}>{(emj) => (
                          <button
                            class="text-xl leading-none p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => insertEmoji(emj)}
                          >
                            {emj}
                          </button>
                        )}</For>
                      </div>
                    </div>
                  </Show>
                </div>

                <div class="flex items-center space-x-3">
                  <Show when={postData().content.length > 0}>
                    <div class="relative w-7 h-7">
                      <svg class="w-7 h-7 -rotate-90 transition-all" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" stroke="#e5e7eb" stroke-width="2" fill="none" />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke={postData().content.length > 380 ? "#ef4444" : "#3b82f6"}
                          stroke-width="2"
                          stroke-dasharray={`${(postData().content.length / 400) * 100},100`}
                          class="transition-all"
                        />
                      </svg>
                      <Show when={postData().content.length > 380}>
                        <span class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-red-500 animate-pulse">
                          {400 - postData().content.length}
                        </span>
                      </Show>
                    </div>
                  </Show>

                  <button
                    onClick={createPost}
                    disabled={!postData().content.trim() || isPosting()}
                    class={joinClass(
                      "px-5 py-2.5 rounded-full font-medium text-white text-sm transition-all duration-300",
                      isPosting() || !postData().content.trim()
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:opacity-90 hover:shadow-md"
                    )}
                  >
                    {isPosting() ? "Posting..." : collection() === "posts" ? "Post" : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </Match>

          {/* --- Error Screen --- */}
          <Match when={hasError()}>
            <div class="modal-box bg-white dark:bg-gray-900 rounded-2xl shadow-2xl text-center p-6 animate-fadeIn">
              <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-6">{error()}</p>
              <button onClick={closeAndReset} class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium">
                Try again
              </button>
            </div>
          </Match>
        </Switch>
      </dialog>
    </>
  );
}
