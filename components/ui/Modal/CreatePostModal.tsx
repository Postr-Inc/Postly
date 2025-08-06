import { createSignal, For, createEffect, onMount, onCleanup } from "solid-js";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { api } from "@/src";
import { joinClass } from "@/src/Utils/Joinclass";
import { Portal, Show, Switch, Match } from "solid-js/web";
import Post from "../PostRelated/Post";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import {
  getFileType,
  getDynamicImageQuality,
  compressImage,
  prepareFile,
} from "@/src/Utils/BetterHandling";
import { dispatchAlert } from "@/src/Utils/SDK";
import { GeneralTypes } from "@/src/Utils/SDK/Types/GeneralTypes";
const getTopicIcon = (icon: string) => {
  switch (icon) {
    case "biology":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M200-120v-80h200v-80q-83 0-141.5-58.5T200-480q0-61 33.5-111t90.5-73q8-34 35.5-55t62.5-21l-22-62 38-14-14-36 76-28 12 38 38-14 110 300-38 14 14 38-76 28-12-38-38 14-24-66q-15 14-34.5 21t-39.5 5q-22-2-41-13.5T338-582q-27 16-42.5 43T280-480q0 50 35 85t85 35h320v80H520v80h240v80H200Zm346-458 36-14-68-188-38 14 70 188Zm-126-22q17 0 28.5-11.5T460-640q0-17-11.5-28.5T420-680q-17 0-28.5 11.5T380-640q0 17 11.5 28.5T420-600Zm126 22Zm-126-62Zm0 0Z" />
        </svg>
      );
    case "technology":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"
          />
        </svg>
      );
    case "engineering":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M42-120v-112q0-33 17-62t47-44q51-26 115-44t141-18q77 0 141 18t115 44q30 15 47 44t17 62v112H42Zm80-80h480v-32q0-11-5.5-20T582-266q-36-18-92.5-36T362-320q-71 0-127.5 18T142-266q-9 5-14.5 14t-5.5 20v32Zm240-240q-66 0-113-47t-47-113h-10q-9 0-14.5-5.5T172-620q0-9 5.5-14.5T192-640h10q0-45 22-81t58-57v38q0 9 5.5 14.5T302-720q9 0 14.5-5.5T322-740v-54q9-3 19-4.5t21-1.5q11 0 21 1.5t19 4.5v54q0 9 5.5 14.5T422-720q9 0 14.5-5.5T442-740v-38q36 21 58 57t22 81h10q9 0 14.5 5.5T552-620q0 9-5.5 14.5T532-600h-10q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T442-600H282q0 33 23.5 56.5T362-520Zm300 160-6-30q-6-2-11.5-4.5T634-402l-28 10-20-36 22-20v-24l-22-20 20-36 28 10q4-4 10-7t12-5l6-30h40l6 30q6 2 12 5t10 7l28-10 20 36-22 20v24l22 20-20 36-28-10q-5 5-10.5 7.5T708-390l-6 30h-40Zm20-70q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm72-130-8-42q-9-3-16.5-7.5T716-620l-42 14-28-48 34-30q-2-5-2-8v-16q0-3 2-8l-34-30 28-48 42 14q6-6 13.5-10.5T746-798l8-42h56l8 42q9 3 16.5 7.5T848-780l42-14 28 48-34 30q2 5 2 8v16q0 3-2 8l34 30-28 48-42-14q-6 6-13.5 10.5T818-602l-8 42h-56Zm28-90q21 0 35.5-14.5T832-700q0-21-14.5-35.5T782-750q-21 0-35.5 14.5T732-700q0 21 14.5 35.5T782-650ZM362-200Z" />
        </svg>
      );
    case "science":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M200-120q-51 0-72.5-45.5T138-250l222-270v-240h-40q-17 0-28.5-11.5T280-800q0-17 11.5-28.5T320-840h320q17 0 28.5 11.5T680-800q0 17-11.5 28.5T640-760h-40v240l222 270q32 39 10.5 84.5T760-120H200Zm0-80h560L520-492v-268h-80v268L200-200Zm280-280Z" />
        </svg>
      );
    case "gaming":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="m272-440 208 120 208-120-168-97v137h-80v-137l-168 97Zm168-189v-17q-44-13-72-49.5T340-780q0-58 41-99t99-41q58 0 99 41t41 99q0 48-28 84.5T520-646v17l280 161q19 11 29.5 29.5T840-398v76q0 22-10.5 40.5T800-252L520-91q-19 11-40 11t-40-11L160-252q-19-11-29.5-29.5T120-322v-76q0-22 10.5-40.5T160-468l280-161Zm0 378L200-389v67l280 162 280-162v-67L520-251q-19 11-40 11t-40-11Zm40-469q25 0 42.5-17.5T540-780q0-25-17.5-42.5T480-840q-25 0-42.5 17.5T420-780q0 25 17.5 42.5T480-720Zm0 560Z" />
        </svg>
      );
    case "software":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z" />
        </svg>
      );
    case "cooking":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M360-120v-120H80v-80h280q33 0 56.5 23.5T440-240v120h-80Zm160 0v-120q0-33 23.5-56.5T600-320h280v80H600v120h-80ZM240-360q-50 0-85-35t-35-85v-160h720v160q0 50-35 85t-85 35H240Zm0-80h480q17 0 28.5-11.5T760-480v-80H200v80q0 17 11.5 28.5T240-440ZM120-680v-80h240v-40q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800v40h240v80H120Zm80 240v-120 120Z" />
        </svg>
      );
    case "anime":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="m440-803-83 83H240v117l-83 83 83 83v117h117l83 83 100-100 168 85-86-167 101-101-83-83v-117H523l-83-83Zm0-113 116 116h164v164l116 116-116 116 115 226q7 13 4 25.5T828-132q-8 8-20.5 11t-25.5-4L556-240 440-124 324-240H160v-164L44-520l116-116v-164h164l116-116Zm0 396Z" />
        </svg>
      );
    case "health":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" />
        </svg>
      );
    case "art":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M160-80q-33 0-56.5-23.5T80-160v-480q0-33 23.5-56.5T160-720h160l160-160 160 160h160q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H160Zm0-80h640v-480H160v480Zm80-80h480L570-440 450-280l-90-120-120 160Zm460-200q25 0 42.5-17.5T760-500q0-25-17.5-42.5T700-560q-25 0-42.5 17.5T640-500q0 25 17.5 42.5T700-440ZM404-720h152l-76-76-76 76ZM160-160v-480 480Z" />
        </svg>
      );
    case "sports":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M440-200q-100 0-170-70t-70-170q0-11 1-22t3-22q-5 2-12 3t-12 1q-42 0-71-29t-29-71q0-42 27.5-71t69.5-29q33 0 59.5 18.5T274-614q33-30 75.5-48t90.5-18h440v160H680v80q0 100-70 170t-170 70ZM180-540q17 0 28.5-11.5T220-580q0-17-11.5-28.5T180-620q-17 0-28.5 11.5T140-580q0 17 11.5 28.5T180-540Zm260 240q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41Zm0-60q33 0 56.5-23.5T520-440q0-33-23.5-56.5T440-520q-33 0-56.5 23.5T360-440q0 33 23.5 56.5T440-360Zm0-80Z" />
        </svg>
      );
    case "business":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm240-600h160v-80H400v80Zm400 360H600v80H360v-80H160v160h640v-160Zm-360 0h80v-80h-80v80Zm-280-80h200v-80h240v80h200v-200H160v200Zm320 40Z" />
        </svg>
      );
    case "entertainment":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="m233-80 54-122q-14-11-27-21.5T235-246q-8 3-15.5 4.5T203-240q-33 0-56.5-23.5T123-320q0-20 8.5-36.5T155-384q-8-23-11-46.5t-3-49.5q0-26 3-49.5t11-46.5q-15-11-23.5-27.5T123-640q0-33 23.5-56.5T203-720q9 0 16.5 1.5T235-714q33-36 75.5-60t90.5-36q5-30 27.5-50t52.5-20q30 0 52.5 20.5T561-810q48 12 90.5 35.5T727-716q8-3 15-4.5t15-1.5q33 0 56.5 23.5T837-642q0 20-8 35.5T807-580q8 24 11 49t3 51q0 26-3 50.5T807-382q14 11 22 26.5t8 35.5q0 33-23.5 56.5T757-240q-8 0-15-1.5t-15-4.5q-12 12-24.5 23.5T675-200l52 120h-74l-38-88q-14 6-27 10.5t-27 7.5q-5 29-27.5 49.5T481-80q-30 0-52.5-20T401-150q-15-3-28.5-7.5T345-168l-38 88h-74Zm76-174 62-140q-14-18-22-40t-8-46q0-57 41.5-98.5T481-620q57 0 98.5 41.5T621-480q0 24-8.5 47T589-392l62 138q9-8 17.5-14.5T685-284q-5-8-6.5-17.5T677-320q0-32 22-55t54-25q6-20 9-39.5t3-40.5q0-21-3-41.5t-9-40.5q-32-2-54-25t-22-55q0-9 2.5-17.5T685-676q-29-29-64-49t-74-31q-11 17-28 26.5t-38 9.5q-21 0-38-9.5T415-756q-41 11-76 31.5T275-674q3 8 5.5 16.5T283-640q0 32-21 54.5T209-560q-6 20-9 39.5t-3 40.5q0 21 3 40.5t9 39.5q32 2 53 25t21 55q0 9-1.5 17.5T275-286q8 9 16.5 16.5T309-254Zm60 34q11 5 22.5 9t23.5 7q11-17 28-26.5t38-9.5q21 0 38 9.5t28 26.5q12-3 22.5-7t21.5-9l-58-130q-12 5-25 7.5t-27 2.5q-15 0-28.5-3t-25.5-9l-58 132Zm112-200q24 0 42-17t18-43q0-24-18-42t-42-18q-26 0-43 18t-17 42q0 26 17 43t43 17Zm0-60Z" />
        </svg>
      );
    case "politics":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M160-120v-80h480v80H160Zm226-194L160-540l84-86 228 226-86 86Zm254-254L414-796l86-84 226 226-86 86Zm184 408L302-682l56-56 522 522-56 56Z" />
        </svg>
      );
    case "music":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" />
        </svg>
      );
    case "education":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#1f1f1f"
        >
          <path d="M300-80q-58 0-99-41t-41-99v-520q0-58 41-99t99-41h500v600q-25 0-42.5 17.5T740-220q0 25 17.5 42.5T800-160v80H300Zm-60-267q14-7 29-10t31-3h20v-440h-20q-25 0-42.5 17.5T240-740v393Zm160-13h320v-440H400v440Zm-160 13v-453 453Zm60 187h373q-6-14-9.5-28.5T660-220q0-16 3-31t10-29H300q-26 0-43 17.5T240-220q0 26 17 43t43 17Z" />
        </svg>
      );
    default:
      return null;
  }
};

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 0 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
  </svg>
);

const MediaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm2 0v14h14V5H5zm2 3l2.5 3.5L12 8.5l4.5 6H7l2-3z" />
  </svg>
);

const GifIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 10.5V8.8h-4.4v6.4h1.7v-2h2v-1.7h-2v-1H19zm-7.3-1.7h1.7v6.4h-1.7V8.8zm-3.6 1.6c.4 0 .9.2 1.2.5l1.2-1C9.9 9.2 9 8.8 8.1 8.8c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2c1 0 1.8-.4 2.4-1.1v-2.5H7.7v1.2h1.2v.6c-.2.1-.5.2-.8.2-.9 0-1.6-.7-1.6-1.6 0-.8.7-1.6 1.6-1.6z" />
  </svg>
);

const PollIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.222 9.16h-1.334c.015-.09.028-.182.028-.277V6.57c0-.98-.797-1.777-1.778-1.777H3.5V3.358c0-.414-.336-.75-.75-.75s-.75.336-.75.75V20.83c0 .414.336.75.75.75s.75-.336.75-.75v-1.434h10.556c.98 0 1.778-.797 1.778-1.777v-2.313c0-.095-.013-.187-.028-.277h4.417c.98 0 1.778-.797 1.778-1.778v-2.31c0-.983-.797-1.78-1.778-1.78zM17.14 6.293c.152 0 .277.124.277.277v2.31c0 .154-.125.28-.278.28H3.472V6.29H17.14zm-2.807 9.014v2.312c0 .153-.125.277-.278.277H3.472v-2.866H14.61c.153 0 .277.125.277.277zm5.695-7.890c.153 0 .277.126.277.28v2.31c0 .154-.124.28-.277.28H3.472V7.403h16.556z" />
  </svg>
);

const EmojiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
    <circle cx="8.5" cy="10.5" r="1.5" />
    <circle cx="15.5" cy="10.5" r="1.5" />
    <path d="M12 18c2.28 0 4.22-1.66 5-4H7c.78 2.34 2.72 4 5 4z" />
  </svg>
);

const ScheduleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const WorldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.01 3.01 0 0 0 17.1 6H16c-.8 0-1.54.37-2.03.99L12 9l-1.97-2.01A2.99 2.99 0 0 0 8 6H6.9c-1.3 0-2.4.84-2.86 2.37L1.5 16H4v6h4v-6h2v6h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5z" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const HashtagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
  </svg>
);
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

  const { navigate } = useNavigation();
  const { theme } = useTheme();
  let [params, setParams] = createSignal<any>(null);
  let [isPosting, setIsPosting] = createSignal(false);
  let [files, setFiles] = createSignal<any>([], { equals: false });
  let [canCommentOnPost, setCanCommentOnPost] = createSignal(true);
  let [mainPost, setMainPost] = createSignal({});
  let [replyRule, setReplyRule] = createSignal("public");
  let [hasError, setHasError] = createSignal(false, { equals: false });
  let [error, setError] = createSignal(null);
  let [topics, setTopics] = createSignal<any[]>([]);
  const [collection, setCollection] = createSignal(
    window.location.pathname.split("/")[2] === "posts" &&
      window.location.pathname.includes("view")
      ? "comments"
      : window.location.pathname.split("/")[2] === "comments" &&
          window.location.pathname.includes("view")
        ? "comments"
        : "posts",
  );
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
    setPostData((prev) => ({
      ...prev,
      embedded_link: url,
      _preview_meta: null,
    }));

    fetch(`${api.serverURL}/opengraph/embed?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((meta) => {
        // Avoid set loop by checking if meta already set
        console.log(meta);
        setPostData((prev) => ({
          ...prev,
          _preview_meta: meta,
          content: prev.content.replace(url, "").trim(),
        }));
      })
      .catch(() => {
        setPostData((prev) => ({
          ...prev,
          _preview_meta: null,
          content: prev.content.replace(url, "").trim(),
        }));
      });
  });

  let [Drafts, setDrafts] = createSignal(
    localStorage.getItem("postDrafts")
      ? JSON.parse(localStorage.getItem("drafts") as any)
      : [],
  );

  async function createPost() {
    if (isPosting()) return;
    setIsPosting(true);
    setHasError(false);

    const data = {
      ...postData(),
      author: JSON.parse(localStorage.getItem("postr_auth") || "{}").id,
    };
    if (data.topic) {
      data.topic = data.topic.id;
    }
    if (!data.author) {
      document.getElementById("createPostModal")?.close();
      dispatchAlert({
        type: "error",
        message: "Author missing can not create post",
      });
      return;
    }
    if (data.isRepost) data.repost = data.repost.id;

    try {
      if (files().length > 0) {
        data.files = await Promise.all(files().map((f) => prepareFile(f)));
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
      console.log(collection());

      console.log(data);

      const res = (await api.collection(collection()).create(data, {
        expand: [
          "author",
          "author.following",
          "author.followers",
          "author.TypeOfContentPosted",
          "likes",
          "repost.likes",
          "repost.author",
          "repost",
        ],
        invalidateCache: [
          `/u/user_${api.authStore.model.username}_posts`,
          ...(collection() == "comments"
            ? `${collection()}-${data.mainComment}-comments`
            : `post-${data.post}`),
          `/u/user_${api.authStore.model.username}/comments`,
        ],
      })) as any;

      if (data.topic) {
        await api.collection("topics").update(
          data.topic,
          {
            posts: [...topics().find((i) => i.id === data.topic).posts, res.id],
          },
          {
            invalidateCache: [
              "topics",
              "topic-get",
              `topic-${topics().find((i) => i.id === data.topic).name}_feed`,
            ],
          },
        );
      }

      setPostData({
        content: "",
        links: [],
        tags: [],
        isRepost: false,
        isPoll: false,
        hashtags: [],
        whoCanSee: "public",
        _preview_meta: null,
        embedded_link: null,
        topic: null,
      });

      if (api.ws) {
        api.ws.send(
          JSON.stringify({
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
                icon: `${api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar || "")}`,
              },
            },
            security: {
              token: api.authStore.model.token,
            },
          }),
        );
      }
      setFiles([]);
      setIsPosting(false);

      if (collection() === "comments") {
        document.getElementById("createPostModal")?.close();

        const postId = window.location.pathname.split("/")[3];
        const p = await api
          .collection(window.location.pathname.split("/")[2])
          .get(postId, {
            expand: ["comments"],
            cacheKey: `post-${data.post}`,
          });
        const d = await api
          .collection(window.location.pathname.split("/")[2])
          .update(postId, {
            comments: [...(p.comments || []), res.id],
            invalidateCache: [
              `/u/user_${api.authStore.model.username}_posts`,
              `post-${data.post}`,
              `/u/user_${api.authStore.model.username}/comments`,
            ],
          });
        api.updateCache("comments", postId, d);

        window.dispatchEvent(
          new CustomEvent("commentCreated", { detail: res }),
        );
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
      var _drafts = Drafts();
      _drafts.push(postData());
      localStorage.setItem("postDrafts", JSON.stringify(_drafts));
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
      expand: ["Users_Subscribed"],
    });

    setTopics(topics.items);
  });

  //@ts-ignore
  window.setParams = (params: any) => {
    setParams(params);
  };

  //@ts-ignore
  window.repost = (post: any) => {
    setPostData({
      ...postData(),
      isRepost: true,
      repost: post,
      hidden: ["repostButton"],
    });
  };
  //@ts-ignore
  window.resetCreatePost = () => {
    setCollection(
      window.location.pathname.split("/")[2] === "posts"
        ? "comments"
        : window.location.pathname.split("/")[2] === "comments"
          ? "comments"
          : "posts",
    );
  };

  //@ts-ignore
  window.setWhoCanReply = (rule) => {
    if (rule == "private") {
      setCanCommentOnPost(false);
      setReplyRule(rule);
    }
  };

  //@ts-ignore
  window.setMainPost = (data) => {
    setMainPost(data);
  };

  function closeAndReset() {
    setCanCommentOnPost(true);
    setReplyRule("public");
    setCollection(
      window.location.pathname.split("/")[2] === "posts" ? "comments" : "posts",
    );
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
      _preview_meta: null,
    });
    document.getElementById("createPostModal")?.close();
  }

  console.log(postData());
  return (
    <dialog id="createPostModal" class="modal">
      <Switch>
        <Match when={isPosting() && !hasError()}>
          <div class="modal-box max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0">
            <div class="flex flex-col items-center justify-center py-12">
              <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Hang tight!
              </h2>
              <p class="text-gray-500 dark:text-gray-400">{currentMessage()}</p>
            </div>
          </div>
        </Match>

        <Match when={!isPosting() && !hasError()}>
          <div class="modal-box max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0 p-0">
            {/* Header */}
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={closeAndReset}
                class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <CloseIcon />
              </button>
              <button class="text-blue-500 font-medium hover:underline">
                Drafts
              </button>
            </div>

            {/* Content */}
            <div class="p-4">
              {/* User Info */}
              <div class="flex items-start space-x-3 mb-4">
                <img
                  src={
                    api.authStore.model?.avatar
                      ? api.cdn.getUrl(
                          "users",
                          api.authStore.model.id,
                          api.authStore.model.avatar,
                        )
                      : "/icons/usernotfound/image.png"
                  }
                  alt="Your avatar"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div class="flex-1 min-w-0">
                  <textarea
                    value={postData().content}
                    maxLength={400}
                    class="w-full bg-transparent text-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white resize-none border-0 outline-none p-0"
                    placeholder={
                      (canCommentOnPost() && replyRule() == "public") ||
                      (!canCommentOnPost() &&
                        mainPost() &&
                        mainPost().expand &&
                        mainPost().expand.author &&
                        mainPost().expand.author.id === api.authStore.model.id)
                        ? "What's happening?"
                        : "Post replies are restricted, only the author can reply"
                    }
                    disabled={
                      !(
                        (canCommentOnPost() && replyRule() == "public") ||
                        (!canCommentOnPost() &&
                          mainPost() &&
                          mainPost().expand &&
                          mainPost().expand.author &&
                          mainPost().expand.author.id ===
                            api.authStore.model.id)
                      )
                    }
                    onInput={(e: any) => {
                      setPostData({ ...postData(), content: e.target.value });
                      // Auto-resize textarea
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 200) + "px";
                    }}
                    style={{ "min-height": "60px" }}
                  />

                  {/* Repost Preview */}
                  <Show when={postData().isRepost}>
                    <div class="mt-4 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                      <Post {...postData().repost} />
                    </div>
                  </Show>

                  {/* Link Preview */}
                  <Show when={postData()._preview_meta}>
                    <a
                      href={postData().embedded_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block mt-4 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Show when={postData()._preview_meta?.image}>
                        <img
                          src={
                            postData()._preview_meta.image || "/placeholder.svg"
                          }
                          class="w-full h-48 object-cover"
                          alt="Link preview"
                        />
                      </Show>
                      <div class="p-3">
                        <p class="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {postData()._preview_meta?.title || "Untitled"}
                        </p>
                        <Show when={postData()._preview_meta?.description}>
                          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {postData()._preview_meta.description}
                          </p>
                        </Show>
                        <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          {(() => {
                            try {
                              return new URL(postData().embedded_link).hostname;
                            } catch {
                              return postData().embedded_link;
                            }
                          })()}
                        </p>
                      </div>
                    </a>
                  </Show>

                  {/* Media Preview */}
                  <Show when={files().length > 0}>
                    <div class="mt-4 grid grid-cols-2 gap-2">
                      <For each={files()}>
                        {(file: File) => (
                          <div class="relative group rounded-2xl overflow-hidden">
                            <Switch>
                              <Match when={getFileType(file) == "image"}>
                                <img
                                  src={
                                    URL.createObjectURL(file) ||
                                    "/placeholder.svg"
                                  }
                                  class="w-full h-48 object-cover"
                                  alt="Upload preview"
                                />
                              </Match>
                              <Match when={getFileType(file) == "video"}>
                                <video
                                  src={URL.createObjectURL(file)}
                                  class="w-full h-48 object-cover"
                                  autoplay
                                  loop
                                  muted
                                />
                              </Match>
                            </Switch>
                            <button
                              onClick={() => {
                                setFiles(
                                  files().filter(
                                    (f: any) => f.name !== file.name,
                                  ),
                                );
                              }}
                              class="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-75 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <CloseIcon />
                            </button>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>

              {/* Reply Settings */}
              <div class="mb-4">
                <button
                  onClick={() =>
                    document.getElementById("visibility")?.showModal()
                  }
                  class="flex items-center space-x-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-full transition-colors"
                >
                  <Switch>
                    <Match when={postData().whoCanSee === "public"}>
                      <WorldIcon />
                      <span class="text-sm font-medium">
                        Everyone can reply
                      </span>
                    </Match>
                    <Match when={postData().whoCanSee === "following"}>
                      <UsersIcon />
                      <span class="text-sm font-medium">People you follow</span>
                    </Match>
                    <Match when={postData().whoCanSee === "private"}>
                      <UserIcon />
                      <span class="text-sm font-medium">Only you</span>
                    </Match>
                  </Switch>
                </button>
              </div>

              {/* Topic Selection */}
              <Show when={postData().topic}>
                <div class="mb-4">
                  <button
                    onClick={() =>
                      document.getElementById("topicPicker")?.showModal()
                    }
                    class="flex items-center space-x-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-2 rounded-full transition-colors"
                  >
                    <HashtagIcon />
                    <span class="text-sm font-medium">
                      {postData().topic?.name || "Add topic"}
                    </span>
                  </button>
                </div>
              </Show>
            </div>

            {/* Footer */}
            <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <div class="flex items-center space-x-4">
                <input
                  type="file"
                  hidden
                  id="files"
                  onInput={(file: any) =>
                    setFiles(Array.from(file.target.files))
                  }
                  multiple
                  accept="image/*, video/*"
                />

                <button
                  onClick={() =>
                    !postData().isPoll &&
                    document.getElementById("files")?.click()
                  }
                  class={joinClass(
                    "p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors",
                    postData().isPoll
                      ? "opacity-50 cursor-not-allowed"
                      : "text-blue-500",
                  )}
                  disabled={postData().isPoll}
                >
                  <MediaIcon />
                </button>

                <button class="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                  <GifIcon />
                </button>

                <button class="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                  <PollIcon />
                </button>

                <button class="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                  <EmojiIcon />
                </button>

                <button class="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                  <ScheduleIcon />
                </button>

                <button class="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                  <LocationIcon />
                </button>
              </div>

              <div class="flex items-center space-x-3">
                <Show when={postData().content.length > 0}>
                  <div class="flex items-center space-x-2">
                    <div class="relative w-8 h-8">
                      <svg
                        class="w-8 h-8 transform -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={
                            postData().content.length > 380
                              ? "#ef4444"
                              : "#3b82f6"
                          }
                          strokeWidth="2"
                          strokeDasharray={`${(postData().content.length / 400) * 100}, 100`}
                        />
                      </svg>
                      <Show when={postData().content.length > 380}>
                        <span class="absolute inset-0 flex items-center justify-center text-xs font-medium text-red-500">
                          {400 - postData().content.length}
                        </span>
                      </Show>
                    </div>
                  </div>
                </Show>

                <button
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
                  disabled={
                    !postData().content.trim() ||
                    postData().content.length > 400 ||
                    isPosting()
                  }
                  class={joinClass(
                    "px-6 py-2 rounded-full font-medium transition-colors",
                    !postData().content.trim() ||
                      postData().content.length > 400 ||
                      isPosting()
                      ? "bg-blue-300 text-white cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white",
                  )}
                >
                  {isPosting()
                    ? "Posting..."
                    : collection() === "posts"
                      ? "Post"
                      : "Reply"}
                </button>
              </div>
            </div>
          </div>
        </Match>

        <Match when={hasError()}>
          <div class="modal-box max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={closeAndReset}
                class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <CloseIcon />
              </button>
              <button class="text-blue-500 font-medium hover:underline">
                Drafts
              </button>
            </div>

            <div class="p-6 text-center">
              <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  class="w-8 h-8 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-6">{error()}</p>
              <button
                onClick={closeAndReset}
                class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </Match>
      </Switch>

      {/* Visibility Modal */}
      <Portal>
        <dialog id="visibility" class="modal">
          <div class="modal-box max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Who can reply?
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Choose who can reply to this post.
            </p>

            <div class="space-y-3">
              {[
                {
                  key: "public",
                  icon: WorldIcon,
                  label: "Everyone",
                  desc: "Anyone on  Postly",
                },
                {
                  key: "following",
                  icon: UsersIcon,
                  label: "People you follow",
                  desc: "People you follow on Postly",
                },
                {
                  key: "private",
                  icon: UserIcon,
                  label: "Only you",
                  desc: "No one else can reply",
                },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    setPostData({ ...postData(), whoCanSee: option.key });
                    document.getElementById("visibility")?.close();
                  }}
                  class="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <option.icon />
                  </div>
                  <div class="flex-1 text-left">
                    <p class="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {option.desc}
                    </p>
                  </div>
                  <Show when={postData().whoCanSee === option.key}>
                    <CheckIcon />
                  </Show>
                </button>
              ))}
            </div>
          </div>
        </dialog>
      </Portal>

      {/* Topic Picker Modal */}
      <Portal>
        <dialog id="topicPicker" class="modal">
          <div class="modal-box max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Choose a topic
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Pick a topic that matches your post.
            </p>

            <div class="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
              <For each={topics()}>
                {(topic) => (
                  <button
                    onClick={() => {
                      setPostData((prev) => ({ ...prev, topic }));
                      document.getElementById("topicPicker")?.close();
                    }}
                    class="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      {getTopicIcon(topic.icon)}
                    </div>
                    <span class="flex-1 text-left font-medium text-gray-900 dark:text-white">
                      {topic.name}
                    </span>
                    <Show when={postData().topic?.id === topic.id}>
                      <CheckIcon />
                    </Show>
                  </button>
                )}
              </For>
            </div>
          </div>
        </dialog>
      </Portal>
    </dialog>
  );
}
