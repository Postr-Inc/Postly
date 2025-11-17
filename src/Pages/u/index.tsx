//@ts-nocheck
import { api } from "@/src";
import ArrowLeft from "@/components/Icons/ArrowLeft";
import Calendar from "@/components/Icons/Calendar";
import Ellipse from "@/components/Icons/Ellipse";
import Link from "@/components/Icons/Link";
import Search from "@/components/Icons/search";
import Verified from "@/components/Icons/Verified";
import { joinClass } from "@/src/Utils/Joinclass";
import Post from "@/components/ui/PostRelated/Post";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { HttpCodes } from "@/src/Utils/SDK/opCodes";
import Page from "@/components/ui/Page";
import StringJoin from "@/src/Utils/StringJoin";
import { Item } from "@kobalte/core/menubar";
import {
  createEffect,
  createSignal,
  For,
  Match,
  Show,
  Switch,
  onMount,
  onCleanup,
} from "solid-js";
import EditProfileModal from "@/components/ui/Modal/EditProfileModal";
import { Portal } from "solid-js/web";
import useFeed from "@/src/Utils/Hooks/useFeed";
import { useParams } from "@solidjs/router";
import LoadingIndicator from "@/components/Icons/loading";
import FollowingListModal from "@/components/ui/Modal/FollowingListModal";
import MapPin from "@/components/Icons/MapPin";
import { GeneralTypes } from "@/src/Utils/SDK/Types/GeneralTypes";
async function handleFeed(
  type: string,
  params: any,
  page: number,
  otherOptions: {
    filter?: string;
    sort?: string;
  },
) {
  return api
    .collection(
      type == "likes" ? "posts" : type == "comments" ? "comments" : "posts",
    )
    .list(page, 10, {
      expand: [
        "author",
        "likes",
        "comments",
        "repost",
        "repost.author",
        "author.followers",
        "post",
      ],
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
  const savedFeed =
    queryParams.get("feed") === "posts"
      ? 1
      : queryParams.get("feed") === "Replies"
        ? 2
        : queryParams.get("feed") === "likes"
          ? 3
          : 1;
  const [view, setView] = createSignal(
    savedFeed === 1
      ? "posts"
      : savedFeed === 2
        ? "comments"
        : savedFeed === 3
          ? "Likes"
          : "posts",
  );
  let [loading, setLoading] = createSignal(true);
  let [posts, setPosts] = createSignal([]);
  const [currentPage, setCurrentPage] = createSignal(1);
  let [notFound, setNotFound] = createSignal(false);
  let [feedLoading, setFeedLoading] = createSignal(false);
  let [totalPages, setTotalPages] = createSignal(0);
  const [feed, setFeed] = createSignal(
    savedFeed === 1
      ? "posts"
      : savedFeed === 2
        ? "Replies"
        : savedFeed === 3
          ? "likes"
          : "posts",
  );
  const [following, setFollowing] = createSignal([]);
  const [showFollowingModal, setShowFollowingModal] = createSignal(false);

  onMount(() => {
    // One-time scroll handler
    const handleScroll = () => {
      if (
        window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight -
            (window.innerWidth > 768 ? 100 : 50) &&
        !feedLoading() &&
        currentPage() < totalPages()
      ) {
        setCurrentPage(currentPage() + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup
    onCleanup(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    createEffect(() => {
      // Reset on user change
      api.checkAuth();
      setCurrentPage(1);
      setNotFound(false);
      setLoading(true);

      api
        .collection("users")
        .list(1, 1, {
          filter: `username="${u.id}"`,
          expand: ["followers", "following"],
          cacheKey: `/u/user_${u.id}`,
        })
        .then((data) => {
          if (!data.items[0]) {
            setNotFound(true);
            setLoading(false);
            return;
          }

          const profile = data.items[0];

          if (profile.deactivated && profile.id !== api.authStore.model.id) {
            setUser({
              ...profile,
              username: "not found",
              bio: "User not found",
            });
            setNotFound(true);
            setLoading(false);
            return;
          }

          setUser(profile);

          // Who to follow suggestion
          if (profile.expand.followers && api.authStore.model.username) {
            const relevant = profile.expand.followers
              .filter(
                (f) =>
                  f.id !== api.authStore.model.id &&
                  !api.authStore.model.following.includes(f.id) &&
                  !f.deactivated,
              )
              .slice(0, 5);
            window.setRelevantPeople(relevant);
          }

          switch (view()) {
            case "posts":
              handleFeed("posts", u, 1, {
                filter: `author.username="${u.id}"`,
                sort: "-pinned",
              }).then((data) => {
                setPosts(data.items);
                setTotalPages(data.totalPages);
                setLoading(false);
              });
              break;
            case "Likes":
              handleFeed("likes", u, 1, {
                filter: `likes ~"${profile.id}" && author.id !="${profile.id}"`,
              }).then((data) => {
                setPosts(data.items);
                setTotalPages(data.totalPages);
                setLoading(false);
              });
              break;
            case "comments":
              handleFeed("comments", u, 1, {
                filter: `author.username="${u.id}"`,
              }).then((data) => {
                setPosts(data.items);
                setTotalPages(data.totalPages);
                setLoading(false);
              });
              break;
          }
        });

      setRelevantText("You might also like");
    });

    // Handle page > 1
    createEffect(() => {
      if (currentPage() <= 1) return;

      const common = { page: currentPage(), user: u };

      switch (view()) {
        case "posts":
          handleFeed("posts", u, currentPage(), {
            filter: `author.username="${u.id}"`,
            sort: "-pinned",
          }).then((data) => {
            setPosts([...posts(), ...data.items]);
            setTotalPages(data.totalPages);
            setLoading(false);
          });
          break;
        case "Likes":
          handleFeed("likes", u, currentPage(), {
            filter: `likes ~"${user().id}" && author.id !="${user().id}"`,
          }).then((data) => {
            setPosts([...posts(), ...data.items]);
            setTotalPages(data.totalPages);
            setLoading(false);
          });
          break;
        case "comments":
          handleFeed("comments", u, currentPage(), {
            filter: `author.username="${u.id}"`,
          }).then((data) => {
            setPosts([...posts(), ...data.items]);
            setTotalPages(data.totalPages);
            setLoading(false);
          });
          break;
      }
    });
  });

  function swapFeed(type: string) {
    if (user().deactivated) {
      setLoading(false);
      return;
    } else {
      setFeedLoading(true);
      setCurrentPage(1);
      setPosts([]);
    }
    switch (type) {
      case "posts":
        handleFeed("posts", u, currentPage(), {
          filter: `author.username="${u.id}"`,
          sort: "-pinned",
        }).then((data: any) => {
          if (data.opCode === HttpCodes.OK) {
            setPosts(data.items);
            setTotalPages(data.totalPages);
            ed;
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
      setFeedLoading(false);
    }, 1000);
  }

  async function follow(type: "follow" | "unfollow") {
    var followers = user().followers || [];
    const hasViewedAPost = api.metrics.getNotedMetrics(
      "followed_after_post_view",
    );

    console.log("Has viewed a post", hasViewedAPost);

    if (type === "follow") {
      if (hasViewedAPost && hasViewedAPost.hasFollowed === false) {
        api.metrics.trackUserMetric(
          "followed_after_post_view",
          hasViewedAPost.postId,
        );
      }
      followers.push(api.authStore.model.id);
    } else {
      followers = followers.filter((id) => id !== api.authStore.model.id);
    }
    setUser({ ...user(), followers });
    try {
      const targetUserId = user().id;

      // Server-side endpoint handles logic
      await api.send("/actions/users/" + type, {
        method: "POST",
        body: {
          targetId: targetUserId,
        },
      });

      if (type == "follow") {
        api.worker.ws.send({
          payload: {
            type: GeneralTypes.NOTIFY,
            notification_data: {
              author: api.authStore.model.id,
              recipients: [user().id],
              url: `${window.location.host}/notifications`,
              notification_title: `${api.authStore.model.username} started following you`,
              notification_body: ``,
              message: ``,
              icon: `${api.authStore.model.avatar ? api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar || "") : "/icons/usernotfound/image.png"}`,
            },
          },
          security: {
            token: api.authStore.model.token,
          },
        });
      }

      // Optionally update local UI (after server confirms)
      // Fetch fresh state or update safely
      const updated = await api.collection("users").get(targetUserId, {
        expand: ["followers"],
        cacheKey: `/u/user_${u.id}`,
      });
      setUser(updated);
      api.updateCache("users", u.id, {
        followers: updated.followers,
      });
    } catch (err) {
      console.error("Follow error", err);
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
          <div
            class={joinClass(
              "flex flex-col items-center justify-center h-screen z-[99999]  ",
            )}
          >
            <div class="loading loading-spinner text-blue-500"></div>
          </div>
        </Match>
        <Match when={!loading()}>
          <div>
            <div
              class={joinClass(
                theme() == "dark" ? "bg-black/95 backdrop-blur-sm text-white" : "bg-white/95 backdrop-blur-sm",
                "sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800",
              )}
            >
              <div class="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto transition-all duration-300 hover:shadow-sm">
                <div class="flex items-center space-x-4">
                  <button
                    onClick={() => goBack()}
                    class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                  >
                    <ArrowLeft class="w-5 h-5" />
                  </button>
                  <div>
                    <h1 class="text-lg sm:text-xl font-bold leading-tight">
                      {user()?.username || "Loading..."}
                    </h1>
                    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{posts().length} posts</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                    <Search class="w-5 h-5" />
                  </button>
                  <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                    <Ellipse class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div class="flex     flex-col relative">
              <div class="relative">
                <div
                  class="h-32 sm:h-40 md:h-48 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
                  style={{
                    "background-size": "cover",
                    "background-image":
                      user() && user().banner
                        ? `url(${user().banner?.includes("blob") ? user().banner : api.cdn.getUrl("users", user().id, user().banner)})`
                        : "linear-gradient(90deg, #ff5858 0%, #f09819 49%, #ff5858 100%)",
                  }}
                >
                  <div class="absolute inset-0 bg-black/20"></div>
                </div>
                <div class="absolute bottom-0 left-4 sm:left-6 transform translate-y-1/2">
                  <div class="relative group">
                     <img
                      src={`${api.authStore.model.avatar ? api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar || "") : "/icons/usernotfound/image.png"}`}
                      alt="Avatar"
                      class="w-32 object-cover h-32 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span class="text-white opacity-0 group-hover:opacity-100 text-xs font-medium transition-opacity duration-300 cursor-pointer"
                      onClick={() => {
                         window.open(`${api.cdn.getUrl("users", user().id, user().avatar || "")}`)
                      }}
                      >View Photo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-4 sm:px-6 pt-16 pb-4 flex justify-between">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <h2 class="text-2xl sm:text-3xl font-bold">{user()?.username}</h2>
                      <Show when={user() && user().verified}>
                        <Verified class="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      </Show>
                      <Show when={user() && user().isEarlyUser}>
                        <span class="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-medium">
                          Early Access
                        </span>
                      </Show>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm sm:text-base">@{user() ? (user().handle || user().username) : "Loading..."}</p>
                  </div>
                  
                </div>
                <div>
                    <Show when={user() && user().id === api.authStore.model.id}>
                      <button
                        onClick={() =>
                          document.getElementById("editProfileModal")?.showModal()
                        }
                        class={joinClass(
                          "px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 active:scale-95",
                          theme() === "dark"
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-200 text-black hover:bg-gray-300"
                        )}
                      >
                        Edit Profile
                      </button>
                    </Show>
                     <Switch>
                      <Match
                        when={
                          user() &&
                          user().id != api.authStore.model.id &&
                          user().followers.includes(api.authStore.model.id)
                        }
                      >
                        <button
                          style={{ "border-radius": "9999px" }}
                          disabled={notFound()}
                          class={joinClass(
                            "px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 active:scale-95",
                            theme() === "dark"
                              ? "bg-gray-700 text-white hover:bg-gray-600"
                              : "bg-gray-200 text-black hover:bg-gray-300"
                          )}
                          onclick={() => {
                            if (notFound()) return;
                            if (!api.authStore.model?.username)
                              return requireSignup();
                            follow("unfollow");
                          }}
                        >
                          Unfollow
                        </button>
                      </Match>
                      <Match
                        when={
                          (!user() && user().id != api.authStore.model.id) ||
                          (user().id != api.authStore.model.id &&
                            !user().followers.includes(api.authStore.model.id) &&
                            !notFound())
                        }
                      >
                        <button
                          style={{ "border-radius": "9999px" }}
                          disabled={notFound()}
                          class={joinClass(
                            "px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 active:scale-95",
                            theme() === "dark"
                              ? "bg-white text-black hover:bg-gray-100"
                              : "bg-black text-white hover:bg-gray-800"
                          )}
                          onclick={() => {
                            if (notFound()) return;
                            if (!api.authStore.model?.username)
                              return requireSignup();
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
                </div>
              </div>
            </div>
            
            <div class="px-4 sm:px-6 pb-4">
              <div class="mb-3">
                <p class="text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200">{user() && user().bio}</p>
              </div>
              
              <div class="flex flex-wrap gap-3 mb-3">
                  {user() &&
                    Array.isArray(user().social) &&
                    user().social.length > 0 && (
                      <div class="flex flex-row gap-1 items-center text-sm">
                        <div class="dropdown rounded">
                          <div
                            tabIndex={0}
                            role="button"
                            class="btn btn-sm rounded px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 border-0"
                            onClick={() => {
                              if (user().social.length > 0) return;
                              else {
                                if (user().social[0].startsWith("https://")) {
                                  window.open(user().social[0], "_blank");
                                }
                              }
                            }}
                          >
                            <Link class="h-4 w-4" />
                            {(() => {
                              try {
                                const url = new URL(user().social[0].trim());
                                return (
                                  url.hostname
                                    .replace("www.", "")
                                    .split(".")[0]
                                    .charAt(0)
                                    .toUpperCase() +
                                  url.hostname
                                    .replace("www.", "")
                                    .split(".")[0]
                                    .slice(1)
                                );
                              } catch {
                                return (
                                  user()
                                    .social[0].split(".")[0]
                                    .toUpperCase()
                                    .charAt(0) + user().social[0].slice(1)
                                );
                              }
                            })()}
                          </div>
                          {user().social.length > 1 && (
                            <ul
                              tabIndex={0}
                              class={joinClass(
                                "dropdown-content menu rounded-box z-10 w-52 p-2 shadow-lg dark:bg-gray-800",
                                theme() === "dark"
                                  ? "bg-gray-800 rounded-xl border border-gray-700"
                                  : "bg-white border border-gray-200",
                              )}
                            >
                              {user().social.map((link) => (
                                <li>
                                  <a
                                    onClick={() => {
                                      if (link.startsWith("https://")) {
                                        window.open(link, "_blank");
                                      }
                                    }}
                                    class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                  >
                                    {(() => {
                                      try {
                                        const url = new URL(link.trim());
                                        return (
                                          url.hostname
                                            .replace("www.", "")
                                            .split(".")[0]
                                            .charAt(0)
                                            .toUpperCase() +
                                          url.hostname
                                            .replace("www.", "")
                                            .split(".")[0]
                                            .slice(1)
                                        );
                                      } catch {
                                        return (
                                          link
                                            .split(".")[0]
                                            .charAt(0)
                                            .toUpperCase() + link.slice(1)
                                        );
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

                  {user() &&
                    typeof user().location === "string" &&
                    user().location.trim() !== "" && (
                      <p class="flex flex-row gap-1 items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200">
                        <MapPin class="h-4 w-4" />
                        <span>{user().location}</span>
                      </p>
                    )}
                  <p class="flex flex-row gap-2 items-center text-sm text-gray-500 dark:text-gray-400">
                    {" "}
                    <Calendar class="h-5 w-5" /> Joined{" "}
                    {user() && months[new Date(user().created).getMonth()]}{" "}
                    {user() && new Date(user().created).getFullYear()}
                  </p>
                </div>
              
              <div class="flex gap-6 text-sm mt-3">
                <span 
                  class="hover:underline cursor-pointer group transition-all duration-200 flex gap-2"
                  onClick={() => setShowFollowingModal(true)}
                >
                  <strong class="group-hover:text-blue-500 transition-colors duration-200">{user()?.following?.length || 0}</strong> 
                  <span class="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Following</span>
                </span>
                <span 
                  class="hover:underline cursor-pointer group transition-all duration-200 flex gap-2"
                  onClick={() => {
                    const modal = document.getElementById("followers-modal");
                    if (modal) (modal as HTMLDialogElement).showModal();
                  }}
                >
                  <strong class="group-hover:text-blue-500 transition-colors duration-200">{user()?.followers?.length || 0}</strong> 
                  <span class="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Followers</span>
                </span>
              </div>
            </div>
            <Show when={user()}>
              <div class="flex border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
                <div class="flex space-x-8 justify-between">
                  <button
                    class={joinClass(
                      "py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-105",
                      view() === "posts" 
                        ? "border-blue-500 text-blue-500" 
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => {
                      setView("posts");
                      swapFeed("posts");
                      setFeed("posts");
                      navigate(`/u/${u.id}?feed=posts`);
                    }}
                  >
                    Posts
                  </button>
                  <button
                    class={joinClass(
                      "py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-105",
                      view() === "comments" 
                        ? "border-blue-500 text-blue-500" 
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => {
                      setView("comments");
                      swapFeed("Replies");
                      setFeed("Replies");
                      navigate(`/u/${u.id}?feed=Replies`);
                    }}
                  >
                    Replies
                  </button>
                  <button
                    class={joinClass(
                      "py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-105",
                      view() === "Likes" 
                        ? "border-blue-500 text-blue-500" 
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => {
                      setView("Likes");
                      swapFeed("Likes");
                      setFeed("likes");
                      navigate(`/u/${u.id}?feed=likes`);
                    }}
                  >
                    Likes
                  </button>
                  <button
                    class={joinClass(
                      "py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-105",
                      view() === "snippets" 
                        ? "border-blue-500 text-blue-500" 
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                    onClick={() => {
                      setView("snippets");
                      swapFeed("snippets");
                      setFeed("snippets");
                      navigate(`/u/${u.id}?feed=snippets`);
                    }}
                  >
                    Snippets
                  </button>
                </div>
              </div>
              <div class="flex flex-col">
                <Switch>
                  <Match when={feedLoading()}>
                    <div class="px-4 py-8">
                      <For each={Array.from({ length: 5 })}>
                        {(_, index) => (
                          <div class="animate-pulse mb-4">
                            <div class="flex items-start space-x-3">
                              <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <div class="flex-1 space-y-3">
                                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                <div class="space-y-2">
                                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </Match>
                  <Match when={!feedLoading()}>
                    {posts().length > 0 ? (
                      <For each={posts()}>
                        {(item: any, index: any) => {
                          let copiedObj = { ...item };
                          return (
                            <div
                              class={joinClass(
                                index() == posts().length - 1 &&
                                  posts().length > 1
                                  ? "sm:mb-[80px]"
                                  : posts().length == 1 && "sm:mb-[75px]",
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
                                setPosts={setPosts}
                                pinned={copiedObj.pinned}
                                expand={copiedObj.expand}
                                embedded_link={copiedObj.embedded_link}
                                route={route}
                                files={copiedObj.files}
                                isPoll={copiedObj.isPoll}
                                isComment={
                                  copiedObj.collectionName === "comments"
                                }
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
                      </For>
                    ) : (
                      <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div class="mb-4">
                          <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          No {feed() === "posts" ? "Posts" : feed() === "Replies" ? "Replies" : feed() === "likes" ? "Likes" : "Snippets"} Found
                        </h3>
                        <p class="text-gray-500 dark:text-gray-400 max-w-md">
                          {user().username} {feed() === "posts" ? "hasn't posted anything yet" : feed() === "Replies" ? "hasn't replied to any posts yet" : feed() === "likes" ? "hasn't liked any posts yet" : "hasn't posted any snippets yet"}.
                        </p>
                      </div>
                    )}
                  </Match>
                </Switch>
              </div>
            </Show>
          </div> 
        </Match>
      </Switch>
      <Portal>
        <EditProfileModal
          updateUser={(data: any) => {
            setUser({ ...user(), ...data });
          }}
        />
        <FollowingListModal
          user={user}
          setFollowing={following}
          onNavigate={(usr) => navigate(`/u/${usr}`)}
          setUser={user}
          show={showFollowingModal}
          setShow={setShowFollowingModal}
        ></FollowingListModal>
      </Portal>
    </Page>
  );
}
