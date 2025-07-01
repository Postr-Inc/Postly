import { createEffect, createSignal } from "solid-js";

export default function Browser() {
    let [url, setUrl] = createSignal("");
    let [loading, setLoading] = createSignal(true);
    let [loaded, setLoaded] = createSignal(false);
    let [error, setError] = createSignal(false);
    let [showFullUrl, setShowFullUrl] = createSignal(false);

    createEffect(() => {
        var b4windowOpen = window.open;
        //@ts-ignore
        window.open = (url: string) => {
            const forbidden = ["github.com", "linkedin.com", "twitter.com", "facebook.com", "instagram.com", "reddit.com", "tiktok.com", "youtube.com", "discord.com", "whatsapp.com", "telegram.org", "snapchat.com"];
            const needsExternal = forbidden.some(domain => url.includes(domain));

            if (needsExternal) {
                b4windowOpen(url, "_blank");
            } else {
                if (document.getElementById("browser-modal")) {
                    setUrl(url);
                    document.getElementById("browser-modal").showModal();
                }
            }
        };

    })
    return (

        <dialog id="browser-modal" class="modal rounded sm:w-full sm:h-full sm:max-w-5xl sm:max-h-5xl    ">
            <div class="bg-white rounded  h-screen   ">
                <div class="mockup-browser h-full   sm:w-screen sm:h-screen">
                    <div class="mockup-browser-toolbar justify-between gap-5">
                        <div class="input"
                            onClick={() => {
                                setShowFullUrl(!showFullUrl())
                            }}
                        >{url()}</div>
                        <button class="btn focus:outline-none btn-circle btn-ghost" onClick={() => {
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
                    <iframe onload={() => {
                        setLoading(false)
                        setLoaded(true)
                    }} onError={()=>{
                        setError(true);
                        setLoading(false);
                    }}src={url()} class="w-full h-full" ></iframe>
                </div>
            </div>
        </dialog>
    )
}
