import { api } from "@/src";
import ArrowLeft from "@/src/components/Icons/ArrowLeft";
import Calendar from "@/src/components/Icons/Calendar";
import Ellipse from "@/src/components/Icons/Ellipse";
import Link from "@/src/components/Icons/Link";
import Search from "@/src/components/Icons/search";
import Verified from "@/src/components/Icons/Verified";
import { joinClass } from "@/src/Utils/Joinclass";
import Post from "@/src/components/PostRelated/Post";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { HttpCodes } from "@/src/Utils/SDK/opCodes";
import Page from "@/src/Utils/Shared/Page";
import StringJoin from "@/src/Utils/StringJoin";
import { Item } from "@kobalte/core/menubar";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import EditProfileModal from "@/src/components/Modals/EditProfileModal";
import { Portal } from "solid-js/web";
import useFeed from "@/src/Utils/Hooks/useFeed";
import { useParams } from "@solidjs/router";
import LoadingIndicator from "@/src/components/Icons/loading";
async function handleFeed(
  type: string,
  params: any,
  page: number,
  user = api.authStore.model,
  otherOptions: {
    filter?:  string, 
    sort?: string,
  }
) { 
  return api.collection(type).list(page, 10, {
    expand: ["author", "likes", "comments", "repost", "repost.author", "author.followers"],
    sort: otherOptions.sort + ",-created" || "-created",
    cacheKey: `/u/${params.id}_${type}_${page}/${JSON.stringify(otherOptions)}`,
    filter: otherOptions.filter || `author.username="${params.id}"`,
  });
}
export default function User() {
  const { params, route, navigate, goBack } = useNavigation("/u/:id");
  const u = useParams();
  const queryParams = new URLSearchParams(window.location.search);
  const [user, setUser] = createSignal(null, { equals: false }) as any;
  const { theme } = useTheme();
   const savedFeed = queryParams.get("feed") === "posts" ? 1 :  queryParams.get("feed") === "Replies" ? 2 : queryParams.get("feed") === "likes" ? 3 : 1
  const [view, setView] = createSignal(savedFeed === 1 ? "posts" : savedFeed === 2 ? "comments" : savedFeed === 3 ? "Likes" : "posts");
  let [loading, setLoading] = createSignal(true); 
  let [posts, setPosts] = createSignal([]); 
  const [currentPage, setCurrentPage] = createSignal(1);
  let [notFound, setNotFound] = createSignal(false);
  let [feedLoading, setFeedLoading] = createSignal(false);
  let [totalPages, setTotalPages] = createSignal(0); 
  const [feed, setFeed] = createSignal(savedFeed === 1 ? "posts" : savedFeed === 2 ? "Replies" : savedFeed === 3 ? "likes" : "posts");
  console.log(posts())
 
  createEffect(() => {
    api.checkAuth()
    setCurrentPage(0)
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    }
    // more on scroll
    
    window.onscroll = function () {
      // handle desktop scrolling
      if (window.innerWidth > 768) {
      if (
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100 &&
        !feedLoading() &&
        currentPage() < totalPages()
      ) {
        setCurrentPage(currentPage() + 1);
      }
      } else if (window.innerWidth <= 768) {
      // handle mobile scrolling
      if (
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50 &&
        !feedLoading() &&
        currentPage() < totalPages()
      ) {
        setCurrentPage(currentPage() + 1);
      }
      }
    };

    
    

    api.collection("users")
      .list(1, 1, {
        filter: StringJoin("username", "=", `"${u.id}"`),
        expand: ["followers", "following"],
        cacheKey: `/u/user_${u.id}`
      })
      .then((data: any) => {
        if (!data.items[0]) {
          setNotFound(true);
          setUser({
            id: crypto.randomUUID(),
            username: "not found",
            created: new Date().toISOString(),
            bio: "User not found",
            followers: [],
            following: [],
            expand: {
              followers: [],
              following: [],
            }
          })
          console.log("not found")
          setLoading(false);
          return;
        } 
        if (data.opCode === HttpCodes.OK) {
          setUser(data.items[0]);
          handleFeed("posts", u, currentPage(), data.items[0], {
            filter: `author.username="${u.id}"`, 
            sort: '-pinned',
          }).then((data: any) => {
            console.log(currentPage())
            if (data.opCode === HttpCodes.OK) { 
              setPosts(data.items); 
              setTotalPages(data.totalPages); 
              setLoading(false);
            }
          });
        }
      });



    //@ts-ignore
    setRelevantText("You might also like") 
    setCurrentPage(1)
  }, [u.id]);

  createEffect(() => {
    console.log("current page", currentPage()) 
    if (currentPage() > 1) {  
      handleFeed(view(),u, currentPage(), user(), {
        filter: `author.username="${u.id}"`, 
        sort: '-pinned',
      }).then((data: any) => {
        if (data.opCode === HttpCodes.OK) {
          setPosts([...posts(), ...data.items]);
          setFeedLoading(false);
        }
      });
    }
  }, [currentPage()]);



  function swapFeed(type: string) {
    setFeedLoading(true)
    setCurrentPage(1)
    switch (type) {
      case "posts":
        console.log(u.id)
        handleFeed("posts", u, currentPage(), user(), {
          filter: `author.username="${u.id}"`, 
        }).then((data: any) => {
          if (data.opCode === HttpCodes.OK) {
            let pinned = data.items.filter((p: any) => p.pinned); 
            let notPinned = data.items.filter((p: any) => !p.pinned);
            data.items = [...pinned, ...notPinned]; 
            setPosts(data.items); 
          } 
        });
        break;
      case "Replies":
        handleFeed("comments", u, currentPage(), user(), {
          filter: `author.username="${u.id}"`, 
        }).then((data: any) => {
          console.log(data)
          if (data.opCode === HttpCodes.OK) {
            setPosts(data.items); 
          }
        });
        break;
      case "Likes":
        console.log(`likes.id ="${api.authStore.model.id} && author.username != "${u.id}"`)
        handleFeed("posts", u, currentPage(), user(), {
          filter: `likes.id ="${u.id}"`, 
        }).then((data: any) => {
          if (data.opCode === HttpCodes.OK) {
            console.log(data)
            setPosts(data.items); 
          }
        });
        break;
      case "snippets":
         
        break;
    }
    setTimeout(() => {
      setFeedLoading(false)
    }, 1000)
  }

  function follow(type: string) { 
    let followers = user().followers as any[]
    let isFollowing = api.authStore.model.following
    switch (type) {
      case "unfollow":
        followers = followers.filter((u) => u != api.authStore.model.id)
        console.log(followers)
        user().followers = followers
        setUser({ ...user(), followers })
        setLoading(false)
        isFollowing = isFollowing.filter((d) => d != user().id)
        break;
      case "follow":
        followers.push(api.authStore.model.id)
        user().followers = followers
        setUser({ ...user(), followers })
        setLoading(false)
        !isFollowing.includes(user().id) && isFollowing.push(user().id)
        break;
    } 
    api.collection("users").update(user().id, {
      followers,
    }, {
      expand: ["followers", "following"],
      cacheKey: `/u/user_${user().username}`, 
    })
    api.collection("users").update(api.authStore.model.id, { following: isFollowing }, {
      expand: ["followers", "following"],
      cacheKey: `/u/${api.authStore.model.username}`
    })
  }
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]; 
   
  return (
    <Page {...{ params, route, navigate, id: "user" }}>
      <Switch>
         
        <Match when={loading()}>
          <div class={
            joinClass("flex flex-col items-center justify-center h-screen z-[99999]  ",
              theme() === "dark" ? "bg-black" : "bg-white"
            )
          }>
            <div class="loading loading-spinner text-blue-500">
            </div>
          </div>
        </Match>
        <Match when={!loading()}>
          <div class="flex flex-col relative">
            <div
              class="flex flex-row justify-between p-2 h-[10rem]"
              style={{
                "background-size": "cover",
                "background-image":
                  user() && user().banner
                    ? `url(${ user().banner.includes("blob") ? user().banner : api.cdn.getUrl("users", user().id, user().banner)})`
                    : "linear-gradient(90deg, #ff5858 0%, #f09819 49%, #ff5858 100%)",
              }}
            >
              <div>
                <ArrowLeft
                  class={`p-2 h-[2.2rem] bg-base-200 cursor-pointer rounded-full bg-opacity-70  `}
                  onClick={() => goBack()}
                />
              </div>

              <div class="flex flex-row gap-2"> 
                <Search class={
                  joinClass(
                    "p-2 h-[2.2rem] bg-base-200 rounded-full bg-opacity-70" 
                  )
                } />
                   
                <Ellipse class={
                  joinClass(
                    "p-2 h-[2.2rem] bg-base-200 rounded-full bg-opacity-70 "
                  )
                } />
              </div>
            </div>

            <div class="flex justify-between items-center ">
              <Switch>
                <Match when={user() && user().avatar}>
                  <img
                    src={user().avatar.includes("blob") ? user().avatar : api.cdn.getUrl("users", user().id, user().avatar)}
                    class={`
                      rounded-full xl:w-24 xl:h-24 w-[5rem] h-[5rem] mx-1 border-2  -mt-12 object-cover
                     ${theme() === "dark" ? "border-white" : "border-base-200"}  
                    `}
                  />
                </Match>
                <Match when={!user() || !user().avatar}>
                  <div class="rounded-full w-24 h-24 mx-1 border-4 border-white -mt-12 bg-base-300 flex items-center justify-center">
                    <p class="text-2xl text-black">{user() && user().username[0]}</p>
                  </div>
                </Match>
              </Switch>
              <Switch>
                <Match
                  when={user() && user().id != api.authStore.model.id && user().followers.includes(api.authStore.model.id)}
                >
                  <button
                  style={{
                    "border-radius":"9999px"
                  }}
                    disabled={notFound()}
                    class={
                      theme() === "dark"
                        ? "bg-black text-black p-2 w-24 mr-2 mt-2 text-sm"
                        : "bg-white text-white p-2 rounded-full w-24 mr-2 text-sm"
                    }
                    onclick={() => notFound() ? null : follow("unfollow")}
                  >
                    Unfollow
                  </button>
                </Match>
                <Match
                  when={
                    !user() && user().id != api.authStore.model.id || user().id != api.authStore.model.id && !user().followers.includes(api.authStore.model.id)
                    && !notFound()
                  }
                >
                  <button
                  
                  style={{
                    "border-radius":"9999px"
                  }}
                    disabled={notFound()}
                    class={
                       joinClass(theme() === "dark"
                       ? "bg-white text-black p-2 mt-2 w-24 mr-2  text-sm"
                       : "bg-black text-white p-2 rounded-full  mt-2 w-24 mr-2 text-sm", "rounded-full")
                    }
                    onclick={() => notFound() ? null : follow("follow")}
                  >
                    Follow
                  </button>
                </Match>
              </Switch>
              <Show when={user() && user().id === api.authStore.model.id}>
                <button
                  onClick={() => document.getElementById("editProfileModal")?.showModal()}
                  class={
                    joinClass(theme() === "dark"
                      ? "bg-white text-black p-2 w-24 mr-2 text-sm"
                      : "bg-black text-white p-2 rounded-full w-24 mr-2 text-sm", "sm:mt-2 md:mt-3","rounded-full")
                  }
                >
                  Edit Profile
                </button>
              </Show>
            </div>
          </div>
          <div class="flex flex-col p-2">
            <h1 class="text-2xl font-bold flex hero gap-2">
              {user() ? user().username : "Loading..."}
              <Show when={user() && user().verified}>
                <Verified class="h-7 w-7 text-white stroke-white fill-blue-500" />
              </Show>
            </h1>
            <span class="text-sm mt-1 opacity-60">
              @{user() && user().username}
              {user() && user().id.slice(0, 5)}
            </span>
            <p class=" mt-2">{user() && user().bio}</p>
            <div class="flex flex-row gap-5 mt-2">
              {user() && user().social && (
                <p class="flex flex-row gap-1 items-center text-sm  ">
                  <Link class="h-4 w-4" />
                  <span onClick={()=>{
                    if(user().social.startsWith("https://")) {
                      window.open(user().social, "_blank");
                    }
                  }} class="text-blue-500">
                    {user() && user().social.split("/")[2].split(".")[0]}
                  </span>
                </p>
              )}
              <p class="flex flex-row gap-2 items-center text-sm opacity-50">
                {" "}
                <Calendar class="h-5 w-5" /> Joined{" "}
                {user() && months[new Date(user().created).getMonth()]}{" "}
                {user() && new Date(user().created).getFullYear()}
              </p>
            </div>

            <div class="flex flex-row gap-2 mt-2">
              {user() && user().following && (
                <p>
                  <span class="font-bold">{user().following.length} </span>{" "}
                  <span class="text-gray-500"> Following</span>
                </p>
              )}
              {user() && user().followers && (
                <p>
                  <span class="font-bold">{user().followers.length} </span>
                  <span class="text-gray-500"> Followers</span>
                </p>
              )}
            </div>
          </div>
          <Show when={user()}>
            <Show when={!user()}>
              <div class="w-screen justify-center flex mx-auto"></div>
            </Show>
            <div class="flex flex-row justify-between p-2 border-b-base-200">
              <p
                class="flex flex-col cursor-pointer border-b-gray-500"
                onClick={() => {
                  setView("posts");
                  swapFeed("posts");
                  setFeed("posts");
                  //set query params to posts
                  navigate(`/u/${u.id}?feed=posts`);
                }}
              >
                Posts
                <Show when={view() === "posts"}>
                  {/**
             * animate slide in from left
             */}
                  <span class="bg-blue-500 w-full text-white p-[0.15rem] rounded-full transition-all duration-300 ease-in-out"></span>
                </Show>
              </p>
              <p
                onClick={() => {
                  setView("comments")
                  swapFeed("Replies")
                  setFeed("Replies")
                  navigate(`/u/${u.id}?feed=Replies`)
                }} class="flex flex-col  cursor-pointer">
                Replies
                <Show when={view() === "comments"}>
                  <span class="bg-blue-500 w-full text-white p-[0.15rem] rounded-full  "></span>
                </Show>
              </p>
              <p onClick={() => {
                setView("Likes")
                swapFeed("Likes")
                setFeed("likes")
                navigate(`/u/${u.id}?feed=likes`)
              }} class="flex flex-col  cursor-pointer">
                Likes
                <Show when={view() === "Likes"}>
                  <span class="bg-blue-500 w-full text-white p-[0.15rem] rounded-full  "></span>
                </Show>
              </p>
              <p onClick={() => setView("snippets")} class="flex flex-col">
                Snippets
                <Show when={view() === "snippets"}>
                  <span class="bg-blue-500 w-full text-white p-[0.15rem] rounded-full  "></span>
                </Show>
              </p>
            </div>
            <div class="flex flex-col">

              <Switch>
                <Match when={feedLoading()}>
                  <For each={Array.from({ length: 10 })}>
                    {() => <LoadingIndicator />}
                  </For>
                </Match>
                <Match when={!feedLoading()}>
                  {posts().length > 0 ?  
                    <For each={posts()}>
                      {(item: any, index: any) => {
                        let copiedObj = { ...item };
                        console.log("copiedObj", copiedObj);
                        return (
                          <div
                            class={joinClass(
                              index() == posts().length - 1 && posts().length > 1
                                ? "sm:mb-[70px]"
                                : ""
                            )}
                          >
                            {" "}
                            <Post
                              noBottomBorder={index() == posts().length - 1}
                              author={copiedObj.author}
                              comments={copiedObj.comments}
                              content={copiedObj.content}
                              created={copiedObj.created}
                              id={copiedObj.id}
                              likes={copiedObj.likes}
                              navigate={navigate}
                              pinned={copiedObj.pinned}
                              expand={copiedObj.expand}
                              route={route}
                              files={copiedObj.files}
                              isPoll={copiedObj.isPoll}
                              isComment={copiedObj.collectionName === "comments"}
                              pollOptions={copiedObj.pollOptions}
                              isRepost={copiedObj.isRepost}
                              pollVotes={copiedObj.pollVotes}
                              pollEnds={copiedObj.pollEnds}
                              whoVoted={copiedObj.whoVoted || []}
                              currentPage={feed()}
                              params={params}
                            />{" "}
                          </div>
                        );
                      }}
                    </For> : <div class="flex flex-col  p-5  mb-5 items-center justify-center">
                      <h1 class="text-3xl">No {feed() === "posts" ? "Posts" : feed() === "Replies" ? "Replies" : feed() === "likes" ? "Likes" : "Snippets"} Found</h1>
                      <p>
                        {user().username}  {feed() === "posts" ? "hasn't posted anything yet." : feed() === "Replies" ? "hasn't replied to any posts yet." : feed() === "likes" ? "hasn't liked any posts yet." : "hasn't posted any snippets yet."}
                      </p>
                    </div> 
                  }
                  
                </Match>
              </Switch>
            </div>
          </Show>
        </Match>
      </Switch>
      <Portal>
        <EditProfileModal  updateUser={(data: any) => { setUser({ ...user(), ...data }) }} />
      </Portal>
    </Page>
  );
}
