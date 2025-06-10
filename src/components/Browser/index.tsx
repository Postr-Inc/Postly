import { createEffect, createSignal } from "solid-js";

export default function Browser() {
    let [url, setUrl] = createSignal("");
    let [loading, setLoading] = createSignal(true);
    let [loaded, setLoaded] = createSignal(false);
    let [error, setError] = createSignal(false);
    let [showFullUrl, setShowFullUrl] = createSignal(false);

    createEffect(()=>{
        //@ts-ignore
        window.open = (url: string) =>{
           if(document.getElementById("browser-modal")){
             setUrl(url)
             var t = setInterval(()=>{
              if(loading() == false && loaded()){
                //@ts-ignore
                document.getElementById("browser-modal").showModal()
                clearInterval(t)
              }
             }, 1000)
           }
        }
    })
    return (

        <dialog id="browser-modal" class="modal rounded sm:w-full sm:h-full sm:max-w-5xl sm:max-h-5xl    ">
            <div class="bg-white rounded  h-screen   ">
                <div class="mockup-browser h-full   sm:w-screen sm:h-screen">
                    <div class="mockup-browser-toolbar justify-between gap-5">
                        <div class="input"
                        onClick={()=>{
                            setShowFullUrl(!showFullUrl())
                        }}
                        >{url()}</div>
                        <button class="btn focus:outline-none btn-circle btn-ghost" onClick={()=>{
                            setUrl("")
                            setLoading(true)
                            setLoaded(false)
                            //@ts-ignore
                            document.getElementById("browser-modal").close()
                        }}> 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <embed onload={()=>{
                        setLoading(false)
                        setLoaded(true)
                    }} src={url()} class="w-full h-full" ></embed>
                </div>
            </div>
        </dialog>
    )
}
