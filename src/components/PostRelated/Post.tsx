import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { api } from "@/src";
import usePost from "@/src/Utils/Hooks/usePost";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
import { For, Match, Show, Switch, createSignal, createEffect, onMount } from "solid-js";
import Heart from "../Icons/heart";
import Dropdown, { DropdownHeader, DropdownItem } from "../UI/UX/dropdown";
import Carousel, { CarouselItem } from "../UI/UX/Carousel";
import StringJoin from "@/src/Utils/StringJoin";
import { A } from "@solidjs/router";
import Verified from "../Icons/Verified";
import Bookmark from "../Icons/Bookmark";
import Share from "../Icons/Share";
const created = (created: any) => {
  let date = new Date(created);
  let now = new Date();
  let diff = now.getTime() - date.getTime();
  let seconds = diff / 1000;
  let minutes = seconds / 60;
  let hours = minutes / 60;
  let days = hours / 24;
  let weeks = days / 7;
  let months = weeks / 4;
  let years = months / 12;
  switch (true) {
    case seconds < 60:
      return `${Math.floor(seconds)}s`;
      break;
    case minutes < 60:
      return `${Math.floor(minutes)}m`;
      break;
    case hours < 24:
      return `${Math.floor(hours)}h`;
      break;
    case days < 7:
      return `${Math.floor(days)}d`;
      break;
    case weeks < 4:
      return `${Math.floor(weeks)}w`;
      break;
    case months < 12:
      return `${Math.floor(months)}mo`;
      break;
    case years > 1:
      return `${Math.floor(years)}y`;
      break;
    default:
      break;
  }
};
type Props = {
  author?: string | any;
  id?: string | any;
  content?: string;
  created?: Date;
  updated?: Date;
  expand?: { [key: string]: any } | any;
  comments?: string[];
  file?: string[];
  isRepost?: boolean;
  disabled?: boolean;
  isComment?: boolean;
  [key: string]: any;
  isLast: boolean;
};

function getFileType(file: string) {
  switch (true) {
    case file.endsWith(".png") :
    case  file.endsWith(".gif"):
    case  file.endsWith(".webp"):
    case file.endsWith(".jpeg"):
    case  file.endsWith(".jpg"):
    case  file.endsWith(".svg"):
      return "image"
    case  file.endsWith(".mp4"):
      return "video"
  }
}

export default function Post(props: Props) {
  let { theme } = useTheme();
  let [likes, setLikes] = createSignal<any[]>(props.likes || []);
  let [comments, setComments] = createSignal<any[]>([]);
  let [commentLength, setCommentLength] = createSignal(
    props?.comments?.length || 0
  );
  let [views, setViews] = createSignal<any[]>(props.views || []);
  function updateLikes(userid: string, isComment: boolean = false, cacheKey: string) {
    let index = likes().findIndex((like) => like === userid);
    if (index === -1) {
      setLikes([...likes(), userid]);
    } else {
      let newLikes = likes().filter((like) => like !== userid);
      setLikes(newLikes);
    }
    api.updateCache(isComment ? "comments" : "posts", props.id, {
      likes: likes(),  
    })
    api
      .collection(isComment ? "comments" : "posts")
      .update(props.id, { likes: likes() });
  }
  
  let [totalVotes, setTotalVotes] = createSignal(0);
  let [pollVotes, setPollVotes] = createSignal(props.pollVotes || 0);
  let [pollOptions, setPollOptions] = createSignal([]);
  let [hasVoted, setHasVoted] = createSignal(props.whoVoted && props.whoVoted.includes(api.authStore.model.id) ? true : false);
  let [pollEnds, setPollEnds] = createSignal(new Date());

  function calculateVotePercentage(votes: number, totalVotes: number) {
    let percentage = (votes / totalVotes) * 100;
    if (isNaN(percentage)) {
      return 0;
    }
    return Math.round(percentage);
  }

 
  onMount(()=>{
     createEffect(() => {
    if (props.isPoll) {
      let votes = 0;
      props.pollOptions.forEach((option: any) => {
        votes += option.votes;
      });
      setTotalVotes(parseInt(votes));
    }
  });
  })

  function calculatePollEnds(ends: Date) {
    const date = new Date(ends);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) {
      return "Ended";
    }


    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44); // Average days in a month
    const years = Math.floor(days / 365.25); // Average days in a year

    if (seconds < 60) {
      return `${seconds}s`;
    } else if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (days < 7) {
      return `${days}d`;
    } else if (weeks < 4) {
      return `${weeks}w`;
    } else if (months < 12) {
      return `${months}mo`;
    } else {
      return `${years}y`;
    }
  }

  async function updatePoll() {
    await api.collection(props.isComment ? "comments" : "posts").update(props.id, {
      pollVotes: pollVotes(),
      pollOptions: pollOptions(),
      whoVoted: [...props.whoVoted, api.authStore.model.id],
    })
  }


  return (
    <Card
      class={joinClass(
        theme() === "dark"
          ? "bg-black text-white border-[#1c1c1c]  "
          : "  border-gray-200 border   ",
        theme() === "dark" && !props.page ? "hover:bg-[#121212]" : theme() === "light" && !props.page ? "hover:bg-[#faf9f9]" : "",
        "z-10  relative h-fit",
        "p-2 text-md shadow-none ",
        window.location.pathname.includes("view") ? "border-r-0 border-b-0  border-l-0" : window.location.pathname.includes('view') && props.isComment ?
          "border-t-0" : "",
        props.disabled
          ? "rounded "
          : `   rounded-none shadow-none${theme() === "dark" && !props.page ? "hover:bg-[#121212]" : theme() === "light" && !props.page ? "hover:bg-[#faf9f9]" : ""
          }`
      )}
    >
      <Show when={props.pinned && window.location.pathname.includes("/u")}>
        <div class="flex hero   gap-5  "><svg viewBox="0 0 24 24" aria-hidden="true" class={
          joinClass(
            "w-4 h-4",
            theme() == "dark" ? "text-white fill-white" : "text-black"
          )
        }><g><path d="M7 4.5C7 3.12 8.12 2 9.5 2h5C15.88 2 17 3.12 17 4.5v5.26L20.12 16H13v5l-1 2-1-2v-5H3.88L7 9.76V4.5z"></path></g></svg>Pinned</div>
      </Show>
      <CardHeader class="flex p-[0.3rem]   mt-2 flex-row gap-3  relative ">

        <Switch fallback={<></>}>
          <Match when={!props.expand?.author.avatar}>
            <div
              class={joinClass(
                "w-10 h-10  text-center p-2 rounded ",
                theme() === "dark"
                  ? "bg-[#121212] text-white"
                  : "bg-[#e2e1e1] text-black"
              )}
            >
              {props.expand?.author.username.slice(0, 1).charAt(0).toUpperCase()}
            </div>
          </Match>

          <Match when={props.expand.author.avatar}>
            <img
              src={api.cdn.getUrl(
                "users",
                props.author,
                props.expand.author.avatar
              )}
              alt={props.author}
              class="w-10 h-10 rounded object-cover"
            />
          </Match>
        </Switch>


        <div class="flex gap-2">
          <div class="flex">
            <CardTitle
              class="cursor-pointer items-center gap-5 "
              onClick={() => props.navigate(StringJoin("/u/", props.expand.author.username))}
            >
              {props.expand.author.username}
            </CardTitle>
            <Show when={props.expand.author.validVerified}>
              <div data-tip="Verified" class="tooltip">
                <Verified class="w-5  h-5 mx-1 text-blue-500 fill-blue-500 stroke-white " />
              </div>
            </Show>
          </div>
          <CardTitle class="text-sm opacity-50"> @{props.expand.author.username}</CardTitle>
          <CardTitle class="text-sm opacity-50">·</CardTitle>
          <CardTitle class="text-sm opacity-50">{created(props.created)}</CardTitle>
        </div>
        <Show when={props.isSnippet}>
          <span class="badge bg-blue-500 p-3 text-white rounded-full">
            ✨ Snippet
          </span>
        </Show>


        <Show when={!props.isComment && !window.location.pathname.includes("/view") || props.isComment && window.location.pathname.includes("/view")}>
          <CardTitle class="absolute right-5">
            <Dropdown direction="left" point="start">
              <DropdownHeader>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6 "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </DropdownHeader>

              <DropdownItem>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                  />
                </svg>

                <p class="font-bold"> Embed Post</p>
              </DropdownItem>
              <DropdownItem>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  class={joinClass(
                    "cursor-pointer hover:rounded-full hover:bg-sky-500 hover:bg-opacity-20  size-6 hover:p-2 hover:text-sky-500 ",
                    theme() === "dark" ? "fill-white" : "fill-black"
                  )}
                >
                  <g>
                    <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                  </g>
                </svg>
                <p class="font-bold w-full"> View Post Engagement </p>
              </DropdownItem>
              <Show when={props.expand.author.id !== api.authStore.model.id}>
                <DropdownItem>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>


                  <p class="font-bold"> Report @{props.expand.author.username}</p>
                </DropdownItem>
              </Show>
              <Show when={props.expand.author.id !== api.authStore.model.id}>
                <DropdownItem>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>

                  <p class="font-bold"> Block @{props.expand.author.username}</p>
                </DropdownItem>
              </Show>

            </Dropdown>
          </CardTitle>
        </Show>
      </CardHeader>
      <CardContent class="p-1 cursor-pointer">

        <a onClick={() => props.navigate(StringJoin("/view/", props.isComment ? "comments/" : "posts/", props.id))}>
          <p class="text-md">{props.content}</p>

        </a>
      </CardContent>
      <Show when={props.isPoll && !hasVoted() && calculatePollEnds(props.pollEnds) !== "Ended"}>
        <div>
          <For each={props.pollOptions}>
            {(item) => (
              <CardContent class="p-1 cursor-pointer">
                <div class="flex gap-2">
                  <div class="flex items-center gap-2">
                    <input type="radio" name="poll" onClick={() => {
                      setPollOptions(props.pollOptions.map((option: any) => {
                        if (option.choice === item.choice) {
                          option.votes++;
                        }
                        return option;
                      }));
                      setHasVoted(true);
                      setTotalVotes(totalVotes() + 1);
                      setPollVotes(pollVotes() + 1);
                      updatePoll();
                    }} />
                    <p>{item.content}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </For>
          <div class="flex gap-2 text-sm mt-2 text-gray-500">
            <div  >
              <Show when={calculatePollEnds(props.pollEnds) !== "Ended"}>

                votes {totalVotes()} - {calculatePollEnds(props.pollEnds)} left
              </Show>
              <Show when={calculatePollEnds(props.pollEnds) == "Ended"}>
                Poll Results - Total Votes {totalVotes()}
              </Show>
            </div>
          </div>
        </div>
      </Show>
      <Show when={props.isPoll && hasVoted() || props.isPoll && calculatePollEnds(props.pollEnds) == "Ended"}>
        <For each={props.pollOptions}>
          {(item) => (
            <CardContent class="p-1 items-center cursor-pointer flex  gap-12 justify-between w-full">
              <div class="flex gap-2 w-full">
                <div class={joinClass("flex items-center gap-2")}
                  style={{ width: `${calculateVotePercentage(parseInt(item.votes), totalVotes())}%`, "background-color": "skyblue", padding: "0.5rem", "border-radius": "0.2rem" }}
                >
                  <p>{item.content}</p>

                </div>
              </div>
              <p class="font-bold">{calculateVotePercentage(parseInt(item.votes), totalVotes())}%</p>
            </CardContent>
          )}
        </For>
        <div class="flex gap-2 text-sm mt-2 text-gray-500">
          <div  >
            <Show when={calculatePollEnds(props.pollEnds) !== "Ended"}>

              votes {totalVotes()} - {calculatePollEnds(props.pollEnds)} left
            </Show>
            <Show when={calculatePollEnds(props.pollEnds) == "Ended"}>
              Poll Results - Total Votes {totalVotes()}
            </Show>
          </div>
        </div>
      </Show>
      <Show when={props.files && props.files.length > 0}>

        <CardContent class="p-1   h-[300px]">

          <Carousel >
          <For each={props.files} fallback={<></>}>
              {(item) => ( 
                <CarouselItem

                  onClick={() => {
                    window.open(api.cdn.getUrl(props.isComment ? "comments" : "posts", props.id, item), "_blank");
                  }}>
                  <Switch>
                    <Match when={getFileType(item) == "image"}>
                      <img
                        src={api.cdn.getUrl(props.isComment ? "comments" : "posts", props.id, item)}
                        class={joinClass(
                          "w-full h-[400px]  object-cover rounded-xl",
                          "cursor-pointer",
                          theme() === "dark"
                            ? "border-[#121212] border"
                            : "border-[#cacaca] border"
                        )}
                      />
                    </Match>
                    <Match when={getFileType(item) == "video"}>
                      <video class={joinClass(
                        "  w-full object-cover rounded-xl",
                        "cursor-pointer",
                        theme() === "dark"
                          ? "border-[#121212] border"
                          : "border-[#cacaca] border"
                      )} src={api.cdn.getUrl(props.isComment ? "comments" : "posts", props.id, item)} controls />
                    </Match>
                  </Switch>
                </CarouselItem>
              )}
            </For>
          </Carousel>
        </CardContent>
      </Show>


      {/**
       * @search - repost section
       */}
      <CardContent class="p-1">

        <Show when={props.isRepost}>
          <Post
            author={props.expand.repost.author}
            id={props.expand.repost.id}
            content={props.expand.repost.content}
            disabled={true}
            created={props.expand.repost.created}
            updated={props.expand.repost.updated}
            expand={props.expand.repost.expand}
            comments={props.expand.repost.comments}
            files={props.expand.repost.files}
          />
        </Show>
      </CardContent>

      {/**
       * @search - footer section
       */}
      <Show when={!props.disabled}>
        <CardFooter class="p-1 flex gap-3 relative items-start">
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              onClick={() => {
                if(!api.authStore.model.id){
                  // assume they have a basic access token
                  document.getElementById("register").showModal()
                }else{
                   updateLikes(api.authStore.model.id, props.isComment)
                }
              }}
              class={joinClass(
                "w-6 h- cursor-pointer",
                likes().includes(api.authStore.model.id)
                  ? "fill-red-500 stroke-red-500"
                  : ""
              )}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
            <span class="countdown">  <span style={{ "--value": Math.abs(props.likes.length) }}></span></span>

          </div>
          <div class="flex items-center gap-2 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6 cursor-pointer"
              onClick={() => props.navigate(StringJoin("/view/", "posts/", props.id))}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              />
            </svg>
            {props.comments?.length}

          </div>
          <Show when={!props.hidden || !props.hidden.includes("repostButton")}>
            <div class=" flex items-center gap-2 "
              onClick={() => {
                //@ts-ignore
                window.repost(props)
                document.getElementById("createPostModal")?.showModal()
              }}
            ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="   hover:rounded-full hover:bg-green-400 hover:bg-opacity-20   hover:text-green-600 cursor-pointer  w-6 h-6 size-6 "><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"></path></svg></div>
          </Show>
          <div class="flex hero gap-2">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              class={joinClass(
                "cursor-pointer hover:rounded-full hover:bg-sky-500 hover:bg-opacity-20  size-6 hover:p-2 hover:text-sky-500 ",
                theme() === "dark" ? "fill-white" : "fill-black"
              )}
            >
              <g>
                <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
              </g>
            </svg>
            {props.views && props.views.length || 0}
          </div>

          <div class="flex absolute right-5 gap-5">
            <Bookmark class="w-6 h-6" />
            <Share class="w-6 h-6" />
          </div>
        </CardFooter>
      </Show>
    </Card>
  );
}
