//@ts-nocheck
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
import { createEffect, createSignal, For, Match, Show, Switch, onMount } from "solid-js";
import EditProfileModal from "@/src/components/Modals/EditProfileModal";
import { Portal } from "solid-js/web";
import useFeed from "@/src/Utils/Hooks/useFeed";
import { useParams } from "@solidjs/router";
import LoadingIndicator from "@/src/components/Icons/loading";
import FollowingListModal from "@/src/components/Modals/FollowingListModal";
import MapPin from "@/src/components/Icons/MapPin";
async function handleFeed(
  type: string,
  params: any,
  page: number,
  otherOptions: {
    filter?: string,
    sort?: string,
  }
) {
  return api.collection(type == "likes" ? "posts" : type == "comments" ? "comments" : "posts").list(page, 10, {
    expand: ["author", "likes", "comments", "repost", "repost.author", "author.followers", "post"],
    sort: otherOptions.sort ? otherOptions.sort + ", -created" : "-created",
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
  const savedFeed = queryParams.get("feed") === "posts" ? 1 : queryParams.get("feed") === "Replies" ? 2 : queryParams.get("feed") === "likes" ? 3 : 1
  const [view, setView] = createSignal(savedFeed === 1 ? "posts" : savedFeed === 2 ? "comments" : savedFeed === 3 ? "Likes" : "posts");
  let [loading, setLoading] = createSignal(true);
  let [posts, setPosts] = createSignal([]);
  const [currentPage, setCurrentPage] = createSignal(1);
  let [notFound, setNotFound] = createSignal(false);
  let [feedLoading, setFeedLoading] = createSignal(false);
  let [totalPages, setTotalPages] = createSignal(0);
  const [feed, setFeed] = createSignal(savedFeed === 1 ? "posts" : savedFeed === 2 ? "Replies" : savedFeed === 3 ? "likes" : "posts");
  const [following, setFollowing] = createSignal([])
  const [showFollowingModal, setShowFollowingModal] = createSignal(false)

  onMount(() => {
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
            setLoading(false);
            return;
          }
          if (data.opCode === HttpCodes.OK) {
            if (data.items[0].deactivated == true && data.items[0].id !== api.authStore.model.id) {
              setUser({
                id: crypto.randomUUID(),
                username: "not found",
                created: new Date().toISOString(),
                bio: "User not found",
                deactivated: true,
                followers: [],
                following: [],
                expand: {
                  followers: [],
                  following: [],
                }
              })
              setLoading(false);
            } else {

              setUser(data.items[0]);
              if (user().expand.followers && api.authStore.model.username) {

                const relevantPeople: any[] = [];

                for (const follower of user().expand.followers) {
                  if (
                    
                    follower.id !== api.authStore.model.id && // not you
                    !api.authStore.model.following.includes(follower.id) && // you don’t follow yet
                    !follower.deactivated &&
                    !relevantPeople.find(p => p.id === follower.id)
                  ) {
                    relevantPeople.push(follower);
                    if (relevantPeople.length >= 5) break;
                  }
                }
                window.setRelevantPeople(relevantPeople)
              }
              switch (view()) {
                case "posts":
                  handleFeed("posts", u, currentPage(), {
                    filter: `author.username="${u.id}"`,
                    sort: '-pinned',
                  }).then((data: any) => {
                    if (data.opCode === HttpCodes.OK) {
                      setPosts(data.items);
                      setTotalPages(data.totalPages);
                      setLoading(false);
                    }
                  });
                  break;
                case "Likes":
                  handleFeed("likes", u, currentPage(), {
                    filter: `likes ~"${user().id}" && author.id !="${user().id}"`,
                  }).then((data: any) => {
                    if (data.opCode === HttpCodes.OK) {
                      setPosts(data.items);
                      setTotalPages(data.totalPages);
                      setLoading(false);
                    }
                  });
                  break;
                case "comments":
                  handleFeed("comments", u, currentPage(), {
                    filter: `author.username="${u.id}"`,
                  }).then((data: any) => {
                    if (data.opCode === HttpCodes.OK) {
                      setPosts(data.items);
                      setLoading(false)
                      setTotalPages(data.totalPages)
                    }
                  });
              }

            }

          }
        });



      //@ts-ignore
      setRelevantText("You might also like")
      setCurrentPage(1)
    }, [u.id]);

    createEffect(() => {
      if (currentPage() > 1) {

        if (user().deactivated) {
          setLoading(false)
          return
        };
        switch (view()) {
          case "posts":
            handleFeed("posts", u, currentPage(), {
              filter: `author.username="${u.id}"`,
              sort: '-pinned',
            }).then((data: any) => {
              if (data.opCode === HttpCodes.OK) {
                setPosts([...posts(), ...data.items]);
                setTotalPages(data.totalPages);
                setLoading(false);
              }
            });
            break;
          case "Likes":
            handleFeed("likes", u, currentPage(), {
              filter: `likes ~"${user().id}" && author.id !="${user().id}"`,
            }).then((data: any) => {
              if (data.opCode === HttpCodes.OK) {
                setPosts([...posts(), ...data.items]);
                setTotalPages(data.totalPages);
                setLoading(false);
              }
            });
            break;
          case "comments":
            handleFeed("comments", u, currentPage(), {
              filter: `author.username="${u.id}"`,
            }).then((data: any) => {
              if (data.opCode === HttpCodes.OK) {
                setPosts([...posts(), ...data.items]);
                setTotalPages(data.items)
                setLoading(false)
              }
            });
          case "snippets":
            break;
        }
      }
    }, [currentPage()]);



  })


  function swapFeed(type: string) {
    if (user().deactivated) {
      setLoading(false)
      return
    } else {

      setFeedLoading(true)
      setCurrentPage(1)
      setPosts([])
    }
    switch (type) {
      case "posts":
        handleFeed("posts", u, currentPage(), {
          filter: `author.username="${u.id}"`,
          sort: '-pinned',
        }).then((data: any) => {
          if (data.opCode === HttpCodes.OK) {
            setPosts(data.items);
            setTotalPages(data.totalPages); ed
            setLoading(false);
          }
        });
        break;
      case "Replies":
        handleFeed("comments", u, currentPage(), {
          filter: `author.username="${u.id}"`,
        }).then((data: any) => {
          if (data.opCode === HttpCodes.OK) {
            setPosts(data.items);
          }
        });
        break;
      case "Likes":
        handleFeed("likes", u, currentPage(), {
          filter: `likes ~"${user().id}" && author.id !="${user().id}"`,
        }).then((data: any) => {
          if (data.opCode === HttpCodes.OK) {
            setPosts([...posts(), ...data.items]);
            setTotalPages(data.totalPages);
            setLoading(false);
          }
        });
        break;
      case "snippets":
        handleFeed("posts", u, currentPage(), {
          filter: `author="${user().id}" && isSnippet=true`,
        }).then((data: any) => {
          if (data.opCode === HttpCodes.OK) {
            setPosts(data.items);
          }
        });
        break;
    }
    setTimeout(() => {
      setFeedLoading(false)
    }, 1000)
  }


  async function follow(type: "follow" | "unfollow") {
    var followers = user().followers || [];
    const hasViewedAPost = api.metrics.getNotedMetrics("followed_after_post_view");

    console.log("Has viewed a post", hasViewedAPost)

    if (type === "follow") {
      if (hasViewedAPost.hasFollowed === false) {
        api.metrics.trackUserMetric("followed_after_post_view", hasViewedAPost.postId)
      }
      followers.push(api.authStore.model.id);
    } else {
      followers = followers.filter(id => id !== api.authStore.model.id);
    }
    setUser({ ...user(), followers });
    try {
      const targetUserId = user().id;

      // Server-side endpoint handles logic
      await api.send("/actions/users/" + type, {
        method: "POST",
        body: {
          targetId: targetUserId
        }
      });

      // Optionally update local UI (after server confirms)
      // Fetch fresh state or update safely
      const updated = await api.collection("users").get(targetUserId, { expand: ["followers"], cacheKey: `/u/user_${u.id}` })
      setUser(updated)
      api.updateCache("users", u.id, {
        followers: updated.followers
      })
    } catch (err) {
      console.error("Follow error", err)
    } finally {
    }
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
                    ? `url(${user().banner?.includes("blob") ? user().banner : api.cdn.getUrl("users", user().id, user().banner)})`
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

            <div class="flex justify-between  items-center ">
              <Switch>
                <Match when={user() && user().avatar}>
                  <img
                    src={user().avatar?.includes("blob") ? user().avatar : api.cdn.getUrl("users", user().id, user().avatar)}
                    class={`
                      rounded-full xl:w-24 xl:h-24 w-[5rem] h-[5rem] mx-1   -mt-12 object-cover
                       
                    `}
                  />
                </Match>
                <Match when={!user() || !user().avatar}>
                  <img
                    src="/icons/usernotfound/image.png"
                    alt={user().username}
                    class={`
                      rounded-full xl:w-24 xl:h-24 w-[5rem] h-[5rem] mx-1   -mt-12 object-cover
                  
                    `}
                  />
                </Match>
              </Switch>
              <Switch>
                <Match
                  when={user() && user().id != api.authStore.model.id && user().followers.includes(api.authStore.model.id)}
                >
                  <button
                    style={{
                      "border-radius": "9999px"
                    }}
                    disabled={notFound()}
                    class={
                      theme() === "dark"
                        ? "bg-white text-black p-2 w-24 mr-2 mt-2 text-sm"
                        : "bg-black text-white mt-2 p-2 rounded-full w-24 mr-2 text-sm"
                    }
                    onclick={() => {
                      if (notFound()) return;
                      //@ts-ignore
                      if (!api.authStore.model?.username) return requireSignup();
                      follow("unfollow");
                    }}
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
                      "border-radius": "9999px"
                    }}
                    disabled={notFound()}
                    class={joinClass(
                      theme() === "dark"
                        ? "bg-white text-black p-2 mt-2 w-40 mr-2 text-sm"
                        : "bg-black text-white p-2 mt-2 w-40 mr-2 text-sm",
                      "rounded-full"
                    )}
                    onclick={() => {
                      if (notFound()) return;
                      //@ts-ignore
                      if (!api.authStore.model?.username) return requireSignup();
                      follow("follow");
                    }}
                  >
                    {notFound()
                      ? "User not found"
                      : !api.authStore.model?.username
                        ? "Join the Community"
                        : "Follow"}
                  </button>

                </Match>
              </Switch>
              <Show when={user() && user().id === api.authStore.model.id}>
                <button
                  onClick={() => document.getElementById("editProfileModal")?.showModal()}
                  class={
                    joinClass(theme() === "dark"
                      ? "bg-white text-black p-2 w-24 mr-2 text-sm"
                      : "bg-black text-white p-2 rounded-full w-24 mr-2 text-sm", "sm:mt-2 md:mt-3", "rounded-full")
                  }
                >
                  Edit Profile
                </button>
              </Show>
            </div>
          </div>
          <div class="flex flex-col   p-2">
            <h1 class="text-2xl font-bold flex hero gap-2">
              {user() ? user().username : "Loading..."}
              <Show when={user() && user().verified}>
                <div data-tip="Verified" class="tooltip tooltip-top"> <Verified class="h-7 w-7 text-white  fill-blue-500" /></div>
              </Show>
              <div>

                {
                  user() ? user().isEarlyUser ? <div data-tip="Early Access Member" class="tooltip tooltip-top"> <img src="/icons/legacy/postr.png" class="w-5 h-5" ></img></div> : <span></span> : ""
                }
              </div>
            </h1>
            <span class="text-sm mt-1 opacity-60">
              @{user() && user().username}
              {user() && user().id.slice(0, 5)}
            </span>
            <p class=" mt-2">{user() && user().bio}</p>
            <div class="flex flex-row gap-5 mt-2">
              {user() && Array.isArray(user().social) && user().social.length > 0 && (
                <div class="flex flex-row gap-1 items-center text-sm">

                  <div class="dropdown rounded">
                    <div
                      tabIndex={0}
                      role="button"
                      class="btn btn-sm rounded px-3 py-1"
                      onClick={() => {
                        if (user().social.length > 0) return;
                        else {
                          if (user().social[0].startsWith("https://")) {
                            window.open(user().social[0], "_blank");
                          }
                        }
                      }}

                    ><Link class="h-4 w-4" />
                      {(() => {
                        try {
                          const url = new URL(user().social[0].trim());
                          return url.hostname.replace("www.", "").split(".")[0].charAt(0).toUpperCase() + url.hostname.replace("www.", "").split(".")[0].slice(1);
                        } catch {
                          return user().social[0].split(".")[0].toUpperCase().charAt(0) + user().social[0].slice(1);
                        }
                      })()}
                    </div>
                    {user().social.length > 1 && (
                      <ul
                        tabIndex={0}
                        class={joinClass("dropdown-content menu   rounded-box z-10 w-52 p-2 shadow dark:bg-base-200", theme()
                          === "dark" ? "bg-base-200 rounded-xl" : "bg-base-100")}
                      >
                        {user().social.map((link) => (
                          <li>
                            <a
                              onClick={() => {
                                if (link.startsWith("https://")) {
                                  window.open(link, "_blank");
                                }
                              }}
                            >
                              {(() => {
                                try {
                                  const url = new URL(link.trim());
                                  return url.hostname.replace("www.", "").split(".")[0].charAt(0).toUpperCase() + url.hostname.replace("www.", "").split(".")[0].slice(1);
                                } catch {
                                  return link.split(".")[0].charAt(0).toUpperCase() + link.slice(1);
                                }
                              })()}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {user() && typeof user().location === "string" && user().location.trim() !== "" && (
                <p class="flex flex-row gap-1 items-center text-sm  ">
                  <MapPin class="h-4 w-4" />
                  <span

                  >
                    {user().location}
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
                  <span onClick={() => {
                    setShowFollowingModal(!showFollowingModal())
                  }} class="text-gray-500 hover:underline cursor-pointer"> Following</span>
                </p>
              )}
              {user() && user().followers && (
                <p>
                  <span class="font-bold">{user().followers.length} </span>
                  <span class="text-gray-500 hover:underline cursor-pointer" onClick={() => {
                    const modal = document.getElementById("followers-modal");
                    if (modal) (modal as HTMLDialogElement).showModal();
                  }}> Followers</span>
                </p>
              )}
            </div>
          </div>
          <Show when={user()}>
            <Show when={!user()}>
              <div class="w-screen justify-center flex mx-auto"></div>
            </Show>
            <div class="flex  flex-row justify-between p-2 border-b-base-200">
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
              <p class="flex flex-col cursor-pointer"
                onClick={() => {
                  setView("snippets")
                  swapFeed("snippets")
                  setFeed("snippets")
                  navigate(`/u/${u.id}?feed=snippets`)
                }}
              >
                Snippets
                <Show when={view() === "snippets"}>
                  <span class="bg-blue-500 w-full text-white p-[0.15rem] rounded-full  "></span>
                </Show>
              </p>
            </div>
            <div class="flex  flex-col">

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
                        return (
                          <div
                            class={joinClass(
                              index() == posts().length - 1 && posts().length > 1
                                ? "sm:mb-[80px]"
                                : posts().length == 1 && "sm:mb-[75px]"
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
                              embedded_link={copiedObj.embedded_link}
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
        <EditProfileModal updateUser={(data: any) => { setUser({ ...user(), ...data }) }} />
        <FollowingListModal user={user} setFollowing={following} setUser={user} show={showFollowingModal} setShow={setShowFollowingModal}></FollowingListModal>
      </Portal>
    </Page>
  );
}
