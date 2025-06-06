import { api } from "@/src";
import { createEffect, createSignal } from "solid-js";
import { HttpCodes } from "../SDK/opCodes";

async function list(collection: any, currentPage: any, feed: any,  options: {filter?: string, sort?:string} = {}) {
  return new Promise((resolve, reject) => {
    api
      .collection(collection)
      .list(currentPage(), 10, {  
        recommended: true,
        order: options.sort || "createdAt",
        filter: options.filter || "",
        cacheKey:`${collection}_${feed()}_${currentPage()}`,
        expand: [
          "comments.likes",
          "comments",
          "comments.author",
          "author",
          "author.following",
          "author.followers",
          "author.followers.following",
          "author.TypeOfContentPosted",
          "likes",
          "repost.likes",
          "repost.author",
          "repost"
        ],
      })
      .then((data: any) => {
        if (data.opCode !== HttpCodes.OK) {
          console.log(data);
          reject(data);
        }
        resolve(data);
      });
  });
}
/**
 * @description Rule of thumb move line heavy code and make it its own hook ( Best practice ) 
 * @param _for 
 */
export default function useFeed(collection: string, options?: { _for?: string, filter?: string , sort?:string}) {
  const [feed, setFeed] = createSignal(options._for === "home" ? "recommended" : "all");
  const [currentPage, setCurrentPage] = createSignal(1);
  const [posts, setPosts] = createSignal<any[]>([], { equals: false });
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [hasMore, setHasMore] = createSignal(true);
  const [refresh, setRefresh] = createSignal(false);
  const [totalPages, setTotalPages] = createSignal(0)

  function reset() {
    setPosts([]);
    setCurrentPage(1);
    setHasMore(true);
  }

 
  function fetchPosts(options: any, reset: boolean){ 
    if(reset){
         
    }
   list(collection, currentPage, feed, options)
    .then((data: any) => {  
      if(reset){
        setPosts(data.items)
      }else{

      setPosts([...posts(), ...data.items]);
      } 
      // for each post subscribe to the post 
      for (let i = 0; i < data?.items.length; i++) {
         api.collection("posts").subscribe(data.items[i].id, {
          cb(data) { 
            
          },
         });
      }
      setLoading(false);
      let relevantPeople: any[] = []
      for (let i = 0; i < data?.items.length; i++) {  
        if(data?.items[i].expand.author.followers.length < 1) continue;
        let followers = data?.items[i].expand.author.expand.followers
        if(followers.length < 1) continue;
        for (let j = 0; j < followers.length; j++) { 
          if (followers[j].id !== api.authStore.model.id   && relevantPeople.length < 5 && !followers[j].followers.includes(api.authStore.model.id) 
          && !relevantPeople.find((i)=> i.id === followers[j].id)  
          ) { 
            relevantPeople.push(followers[j]);
          } 
        }
      } 
      //@ts-ignore
      window.setRelevantPeople && setRelevantPeople(relevantPeople); 
      if (data.totalPages <= currentPage()) {
        setHasMore(false);
      }
    })
    .catch((e) => {
      console.log(e);
      setError(e);
    });
  }
  createEffect(() => {
    window.addEventListener("popstate", () => { 
      setLoading(true);
      setPosts([]);
      setCurrentPage(1);
      setHasMore(true); 
    }); 
    // HANDLE SCROLLING
    async function handleScroll() { 
      // Prevent fetching if already loading or refreshing
      if (loading() || refresh()) {
        return;
      }
    
 
      // Check if the user is not at the bottom of the page
      if (window.innerHeight + window.scrollY  <  document.body.offsetHeight - 100) {
        console.log("not at bottom, returning");
        return
      } 
 
     
      // Check if there are more pages to fetch
      if (hasMore()) {
        console.log("fetching more"); 
        setLoading(true); // Set loading to true before fetching
        try {
          const currentPageValue = currentPage() + 1;
          setCurrentPage(currentPageValue); 
          const data = await list(collection, currentPage, feed, options) as any; 
          setPosts([...posts(), ...data?.items]);
          if(data.totalPages){
            setTotalPages(data.totalPages)
          } 
          if (data.totalPages <= currentPageValue) {
            console.log("no more pages to load");
            console.log(currentPageValue)
            setHasMore(false);
          }
        } catch (e) { 
          setError(e as any);
        } finally {
          setLoading(false); // Ensure loading is set to false after fetching
        }
      }
    }
    window.addEventListener("scroll", handleScroll);
    // handle refresh mobile swipe
    function handleTouchStart(e: TouchEvent) {
      if (e.touches[0].clientY < 50) {
        setRefresh(true);
      }
    } 
    function handleTouchEnd(e: TouchEvent) {
      setRefresh(false);
    }
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    
    fetchPosts({filter:   feed() === "following" ? `author.followers ~ "${api.authStore.model.id}"` : ''}, true)
    
  });
 
 
  fetchPosts(options, false)
   
  
  return { feed, currentPage, posts,  loading, error, hasMore, setFeed, reset, setPosts };
}
