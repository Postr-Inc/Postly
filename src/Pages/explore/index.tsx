"use client"

import { api } from "@/src"
import useNavigation from "@/src/Utils/Hooks/useNavigation"
import useTheme from "@/src/Utils/Hooks/useTheme"
import { joinClass } from "@/src/Utils/Joinclass"
import Page from "@/src/Utils/Shared/Page"
import { createSignal, createMemo, onMount, For } from "solid-js"


const getTopicIcon = (icon: string) => {
  switch (icon) {
    case "biology":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120v-80h200v-80q-83 0-141.5-58.5T200-480q0-61 33.5-111t90.5-73q8-34 35.5-55t62.5-21l-22-62 38-14-14-36 76-28 12 38 38-14 110 300-38 14 14 38-76 28-12-38-38 14-24-66q-15 14-34.5 21t-39.5 5q-22-2-41-13.5T338-582q-27 16-42.5 43T280-480q0 50 35 85t85 35h320v80H520v80h240v80H200Zm346-458 36-14-68-188-38 14 70 188Zm-126-22q17 0 28.5-11.5T460-640q0-17-11.5-28.5T420-680q-17 0-28.5 11.5T380-640q0 17 11.5 28.5T420-600Zm126 22Zm-126-62Zm0 0Z" /></svg>
      )
    case "technology":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
        </svg>
      )
    case "engineering":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M42-120v-112q0-33 17-62t47-44q51-26 115-44t141-18q77 0 141 18t115 44q30 15 47 44t17 62v112H42Zm80-80h480v-32q0-11-5.5-20T582-266q-36-18-92.5-36T362-320q-71 0-127.5 18T142-266q-9 5-14.5 14t-5.5 20v32Zm240-240q-66 0-113-47t-47-113h-10q-9 0-14.5-5.5T172-620q0-9 5.5-14.5T192-640h10q0-45 22-81t58-57v38q0 9 5.5 14.5T302-720q9 0 14.5-5.5T322-740v-54q9-3 19-4.5t21-1.5q11 0 21 1.5t19 4.5v54q0 9 5.5 14.5T422-720q9 0 14.5-5.5T442-740v-38q36 21 58 57t22 81h10q9 0 14.5 5.5T552-620q0 9-5.5 14.5T532-600h-10q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T442-600H282q0 33 23.5 56.5T362-520Zm300 160-6-30q-6-2-11.5-4.5T634-402l-28 10-20-36 22-20v-24l-22-20 20-36 28 10q4-4 10-7t12-5l6-30h40l6 30q6 2 12 5t10 7l28-10 20 36-22 20v24l22 20-20 36-28-10q-5 5-10.5 7.5T708-390l-6 30h-40Zm20-70q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm72-130-8-42q-9-3-16.5-7.5T716-620l-42 14-28-48 34-30q-2-5-2-8v-16q0-3 2-8l-34-30 28-48 42 14q6-6 13.5-10.5T746-798l8-42h56l8 42q9 3 16.5 7.5T848-780l42-14 28 48-34 30q2 5 2 8v16q0 3-2 8l34 30-28 48-42-14q-6 6-13.5 10.5T818-602l-8 42h-56Zm28-90q21 0 35.5-14.5T832-700q0-21-14.5-35.5T782-750q-21 0-35.5 14.5T732-700q0 21 14.5 35.5T782-650ZM362-200Z" /></svg>
      )
    case "science":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-51 0-72.5-45.5T138-250l222-270v-240h-40q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760h-40v240l222 270q32 39 10.5 84.5T760-120H200Zm0-80h560L520-492v-268h-80v268L200-200Zm280-280Z" /></svg>
      )
    case "gaming":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m272-440 208 120 208-120-168-97v137h-80v-137l-168 97Zm168-189v-17q-44-13-72-49.5T340-780q0-58 41-99t99-41q58 0 99 41t41 99q0 48-28 84.5T520-646v17l280 161q19 11 29.5 29.5T840-398v76q0 22-10.5 40.5T800-252L520-91q-19 11-40 11t-40-11L160-252q-19-11-29.5-29.5T120-322v-76q0-22 10.5-40.5T160-468l280-161Zm0 378L200-389v67l280 162 280-162v-67L520-251q-19 11-40 11t-40-11Zm40-469q25 0 42.5-17.5T540-780q0-25-17.5-42.5T480-840q-25 0-42.5 17.5T420-780q0 25 17.5 42.5T480-720Zm0 560Z" /></svg>
      )
    case "software":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z" /></svg>
      )
    case "cooking":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M360-120v-120H80v-80h280q33 0 56.5 23.5T440-240v120h-80Zm160 0v-120q0-33 23.5-56.5T600-320h280v80H600v120h-80ZM240-360q-50 0-85-35t-35-85v-160h720v160q0 50-35 85t-85 35H240Zm0-80h480q17 0 28.5-11.5T760-480v-80H200v80q0 17 11.5 28.5T240-440ZM120-680v-80h240v-40q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800v40h240v80H120Zm80 240v-120 120Z" /></svg>
      )
    case "anime":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m440-803-83 83H240v117l-83 83 83 83v117h117l83 83 100-100 168 85-86-167 101-101-83-83v-117H523l-83-83Zm0-113 116 116h164v164l116 116-116 116 115 226q7 13 4 25.5T828-132q-8 8-20.5 11t-25.5-4L556-240 440-124 324-240H160v-164L44-520l116-116v-164h164l116-116Zm0 396Z" /></svg>
      )
    case "health":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" /></svg>
      )
    case "art":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-80q-33 0-56.5-23.5T80-160v-480q0-33 23.5-56.5T160-720h160l160-160 160 160h160q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H160Zm0-80h640v-480H160v480Zm80-80h480L570-440 450-280l-90-120-120 160Zm460-200q25 0 42.5-17.5T760-500q0-25-17.5-42.5T700-560q-25 0-42.5 17.5T640-500q0 25 17.5 42.5T700-440ZM404-720h152l-76-76-76 76ZM160-160v-480 480Z" /></svg>
      )
    case "sports":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-200q-100 0-170-70t-70-170q0-11 1-22t3-22q-5 2-12 3t-12 1q-42 0-71-29t-29-71q0-42 27.5-71t69.5-29q33 0 59.5 18.5T274-614q33-30 75.5-48t90.5-18h440v160H680v80q0 100-70 170t-170 70ZM180-540q17 0 28.5-11.5T220-580q0-17-11.5-28.5T180-620q-17 0-28.5 11.5T140-580q0 17 11.5 28.5T180-540Zm260 240q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41Zm0-60q33 0 56.5-23.5T520-440q0-33-23.5-56.5T440-520q-33 0-56.5 23.5T360-440q0 33 23.5 56.5T440-360Zm0-80Z" /></svg>
      )
    case "business":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm240-600h160v-80H400v80Zm400 360H600v80H360v-80H160v160h640v-160Zm-360 0h80v-80h-80v80Zm-280-80h200v-80h240v80h200v-200H160v200Zm320 40Z" /></svg>
      )
    case "entertainment":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m233-80 54-122q-14-11-27-21.5T235-246q-8 3-15.5 4.5T203-240q-33 0-56.5-23.5T123-320q0-20 8.5-36.5T155-384q-8-23-11-46.5t-3-49.5q0-26 3-49.5t11-46.5q-15-11-23.5-27.5T123-640q0-33 23.5-56.5T203-720q9 0 16.5 1.5T235-714q33-36 75.5-60t90.5-36q5-30 27.5-50t52.5-20q30 0 52.5 20.5T561-810q48 12 90.5 35.5T727-716q8-3 15-4.5t15-1.5q33 0 56.5 23.5T837-642q0 20-8 35.5T807-580q8 24 11 49t3 51q0 26-3 50.5T807-382q14 11 22 26.5t8 35.5q0 33-23.5 56.5T757-240q-8 0-15-1.5t-15-4.5q-12 12-24.5 23.5T675-200l52 120h-74l-38-88q-14 6-27 10.5t-27 7.5q-5 29-27.5 49.5T481-80q-30 0-52.5-20T401-150q-15-3-28.5-7.5T345-168l-38 88h-74Zm76-174 62-140q-14-18-22-40t-8-46q0-57 41.5-98.5T481-620q57 0 98.5 41.5T621-480q0 24-8.5 47T589-392l62 138q9-8 17.5-14.5T685-284q-5-8-6.5-17.5T677-320q0-32 22-55t54-25q6-20 9-39.5t3-40.5q0-21-3-41.5t-9-40.5q-32-2-54-25t-22-55q0-9 2.5-17.5T685-676q-29-29-64-49t-74-31q-11 17-28 26.5t-38 9.5q-21 0-38-9.5T415-756q-41 11-76 31.5T275-674q3 8 5.5 16.5T283-640q0 32-21 54.5T209-560q-6 20-9 39.5t-3 40.5q0 21 3 40.5t9 39.5q32 2 53 25t21 55q0 9-1.5 17.5T275-286q8 9 16.5 16.5T309-254Zm60 34q11 5 22.5 9t23.5 7q11-17 28-26.5t38-9.5q21 0 38 9.5t28 26.5q12-3 22.5-7t21.5-9l-58-130q-12 5-25 7.5t-27 2.5q-15 0-28.5-3t-25.5-9l-58 132Zm112-200q24 0 42-17t18-43q0-24-18-42t-42-18q-26 0-43 18t-17 42q0 26 17 43t43 17Zm0-60Z" /></svg>
      )
    case "politics":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-120v-80h480v80H160Zm226-194L160-540l84-86 228 226-86 86Zm254-254L414-796l86-84 226 226-86 86Zm184 408L302-682l56-56 522 522-56 56Z" /></svg>
      )
    case "music":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" /></svg>
      )
    case "education":
      return (

        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M300-80q-58 0-99-41t-41-99v-520q0-58 41-99t99-41h500v600q-25 0-42.5 17.5T740-220q0 25 17.5 42.5T800-160v80H300Zm-60-267q14-7 29-10t31-3h20v-440h-20q-25 0-42.5 17.5T240-740v393Zm160-13h320v-440H400v440Zm-160 13v-453 453Zm60 187h373q-6-14-9.5-28.5T660-220q0-16 3-31t10-29H300q-26 0-43 17.5T240-220q0 26 17 43t43 17Z" /></svg>
      )
    default:
      return null
  }
}

const MoreHorizontalIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
)

const LOCAL_STORAGE_KEY = 'subscribedTopics'

export default function ExplorePage() {
  const { route, navigate } = useNavigation()
  const [subscribedTopics, setSubscribedTopics] = createSignal<[{ name: string, slug: string, icon: string }]>([])
  let [trendingHashtags, setTrendingHashtags] = createSignal([])
  let [TOPICS, setTopics] = createSignal([])
  const { theme } = useTheme()
  const [search, setSearch] = createSignal("");

  const filteredTopics = () =>
    TOPICS().filter(topic =>
      topic.name.toLowerCase().includes(search().toLowerCase())
    );
  async function getTrendingHashTags() {
    const tags = await api.collection("Hashtags").list(1, 15, {
      filter: `posts:length > 0`,
      cacheKey: `tending-hashtags-${new Date().getDate()}`,
      expand: ["posts", "posts.author"],
    }) as { items: [] }
    setTrendingHashtags(tags.items)
  }
  // Load from localStorage on mount
  onMount(async () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    let topics = await api.collection("topics").list(1, 20, {
      cacheKey: `topics`,
      filter: ``,
      expand: ["Users_Subscribed"]
    })
    console.log(topics)
    setTopics(topics.items)
    if (stored) {
      try {
        setSubscribedTopics(JSON.parse(stored))
      } catch {
        setSubscribedTopics([])
      }
    }

    getTrendingHashTags()
  })

  // Toggle subscription for a topic
  const toggleSubscription = async (topic: { id: string; slug: string;[key: string]: any }) => {
    let current = subscribedTopics() || [];

    const isSubscribed = current.some(t => t.slug === topic.slug);
    let updated;

    if (isSubscribed) {
      updated = current.filter(t => t.slug !== topic.slug);
    } else {
      updated = [...current, topic];
    }

    setSubscribedTopics(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    // Pass both the current topic and the new state
    await updateUserSubscription(topic, !isSubscribed);
  };
  async function updateUserSubscription(
    topic: { id: string },
    shouldSubscribe: boolean
  ) {
    const userId = api.authStore.model.id;

    // Fetch fresh topic to get current users
    const fullTopic = await api.collection("topics").get(topic.id, { expand: ["Users_Subscribed"], cacheKey: `topics-get` })
    const currentUsers: string[] = fullTopic.expand?.Users_Subscribed ?? [];

    let updatedUsers: string[];

    if (shouldSubscribe) {
      updatedUsers = Array.from(new Set([...currentUsers, userId]));
    } else {
      updatedUsers = currentUsers.filter(uid => uid !== userId);
    }

    await api.collection("topics").update(topic.id, {
      Users_Subscribed: updatedUsers,
    }, {
      invalidateCache: ["topics", "topics-get"],
    });
  }




  const isSubscribed = (slug: string) =>
    subscribedTopics().some(t => t.slug === slug);

  const [expanded, setExpanded] = createSignal(false);
  const visibleTopics = () => {
    const all = filteredTopics();
    return expanded() ? all : all.slice(0, 6);
  };
  return (
    <Page {...{ route, navigate }}>
      <div class="w-full p-2   my-8">
        {/* Topics Section */}
        <div class="   rounded-2xl  ">
          <h2 class="text-3xl font-bold mb-8   tracking-tight">
            Topics to Subscribe
          </h2>
          <div class={joinClass(
            "max-h-[70vh] overflow-y-auto scrollbar-hide",
          )}>
            <input
              type="text"
              placeholder="Search topics..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
              class={joinClass("mb-4 px-4 py-2 w-full border rounded-full focus:outline-none   dark:bg-gray-900 text-sm dark:text-white", theme() == "dark" && "bg-base-300 border-none")}
            />
            <For each={visibleTopics()}>
              {(topic) => (
                <div
                  key={topic.slug}
                  class={joinClass(
                    "group flex items-center justify-between  p-5 py-3  mb-2 rounded-xl transition-all duration-200 cursor-pointer border",
                    theme() === "dark"
                      ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600"
                      : "bg-gray-50/80 border-gray-200/50 hover:bg-gray-100 hover:border-gray-300"
                  )}
                >
                  {/* Left side - Icon and Topic Info */}
                  <div class="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div class={joinClass(
                      "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",

                    )}>
                      <div class={joinClass(
                        "transition-colors duration-200   fill-white",
                      )}>
                        {getTopicIcon(topic.icon)}
                      </div>
                    </div>

                    {/* Topic Info */}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2">
                        {/* Topic Name */}
                        <h3 class={joinClass(
                          "font-semibold text-sm truncate transition-colors duration-200",
                          theme() === "dark"
                            ? "text-gray-100 group-hover:text-white"
                            : "text-gray-900 group-hover:text-black"
                        )}>
                          {topic.name.startsWith('#') ? topic.name : `#${topic.name}`}
                        </h3>
                      </div>

                      {/* Category and Stats */}
                      <div class="flex items-center space-x-2 mt-1">
                        <span class={joinClass(
                          "text-xs font-medium capitalize",
                          theme() === "dark" ? "text-blue-400" : "text-blue-600"
                        )}>
                          {topic.category || 'Trending'}
                        </span>
                        <span class={joinClass(
                          "text-xs",
                          theme() === "dark" ? "text-white" : "text-gray-500"
                        )}>
                          •
                        </span>
                        <span class={joinClass(
                          "text-xs",
                          theme() === "dark" ? "text-white" : "text-gray-500"
                        )}>
                          {topic.posts.length} posts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Subscribe Button */}
                  <button
                    onClick={() => toggleSubscription(topic)}
                    class={joinClass(
                      "relative overflow-hidden px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform active:scale-95 ml-3 flex-shrink-0",
                      isSubscribed(topic.slug)
                        ? theme() === "dark"
                          ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg shadow-green-500/20"
                          : "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400 shadow-lg shadow-green-500/25"
                        : theme() === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white focus:ring-gray-500 border border-gray-600"
                          : "bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-400 border border-gray-300 shadow-sm"
                    )}
                  >
                    <span class="relative z-10">
                      {isSubscribed(topic.slug) ? "✓ Following" : "Follow"}
                    </span>

                    {/* Subtle shine effect */}
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                  </button>
                </div>
              )}
            </For>
          </div>
          <Show when={filteredTopics().length > 6}>
            <button
              onClick={() => setExpanded(!expanded())}
              class="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {expanded() ? "Show Less" : "Show More"}
            </button>
          </Show>
        </div>

        {/* Trending Section */}
        <div class={joinClass(
          "mt-5 mb-12  ",
          theme() === "dark" ? "border-gray-800" : "border-slate-200"
        )}>
          <h2 class={joinClass(
            "text-2xl font-bold mb-6",
            theme() === "dark" ? "text-gray-100" : "text-gray-900"
          )}>
            Trending Hashtags
          </h2>

          <div class={joinClass(
            "max-h-[70vh] overflow-y-auto scrollbar-hide",
          )}>
            <For each={trendingHashtags()}>
              {(tag) => (
                <div
                  key={tag.name}
                  class={joinClass(
                    "group flex items-center justify-between px-4 py-4 mx-2 mb-2 rounded-xl transition-all duration-200 cursor-pointer border",
                    theme() === "dark"
                      ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600"
                      : "bg-gray-50/80 border-gray-200/50 hover:bg-gray-100 hover:border-gray-300"
                  )}
                >
                  {/* Left side - Hashtag Info */}
                  <div class="flex-1 min-w-0 pr-3">
                    {/* Hashtag Name */}
                    <div class="flex items-center space-x-2 mb-1">
                      <h3 class={joinClass(
                        "font-semibold text-sm transition-colors duration-200",
                        theme() === "dark"
                          ? "text-gray-100 group-hover:text-white"
                          : "text-gray-900 group-hover:text-black"
                      )}>
                        #{tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
                      </h3>

                      {/* Trending indicator */}
                      <div class={joinClass(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        theme() === "dark"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      )}>
                        Trending
                      </div>
                    </div>

                    {/* Latest Post Preview */}
                    <p class={joinClass(
                      "text-sm line-clamp-2 mb-2 transition-colors duration-200",
                      theme() === "dark"
                        ? "text-gray-300 group-hover:text-gray-200"
                        : "text-gray-600 group-hover:text-gray-700"
                    )}>
                      {tag.expand.posts[0].content}
                    </p>

                    {/* Post Count */}
                    <div class="flex items-center space-x-2">
                      <span class={joinClass(
                        "text-xs font-medium",
                        theme() === "dark" ? "text-blue-400" : "text-blue-600"
                      )}>
                        Trending
                      </span>
                      <span class={joinClass(
                        "text-xs",
                        theme() === "dark" ? "text-gray-500" : "text-gray-500"
                      )}>
                        •
                      </span>
                      <span class={joinClass(
                        "text-xs",
                        theme() === "dark" ? "text-gray-400" : "text-gray-500"
                      )}>
                        {tag.expand.posts.length} posts
                      </span>
                    </div>
                  </div>

                  {/* Right side - More Options Button */}
                  <button
                    class={joinClass(
                      "flex-shrink-0 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform active:scale-95",
                      theme() === "dark"
                        ? "hover:bg-gray-700 focus:ring-gray-500 text-gray-400 hover:text-gray-300"
                        : "hover:bg-gray-200 focus:ring-gray-300 text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <MoreHorizontalIcon class="w-5 h-5" />
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>


      </div>
    </Page>
  )
}
