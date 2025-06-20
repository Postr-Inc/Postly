import { createSignal, onMount, Show } from "solid-js";
import type { AlertPayload } from "../SDK";

export default function CustomAlertDialog() {
  const [_alert, setAlert] = createSignal<AlertPayload | null>(null, {
    equals: false,
  });

  onMount(() => {
    const handler = (e: CustomEvent<AlertPayload>) => {
      setAlert(e.detail);
    };

    window.addEventListener("custom-alert", handler as EventListener);

    return () => {
      window.removeEventListener("custom-alert", handler as EventListener);
    };
  });

  return (
    <Show when={_alert()}>
       <div class="p-5 flex mx-auto justify-center flex-col gap-5">
        <div class={`alert text-white bg-red-500 p-2 alert-${_alert()!.type} `}>
        <p>{_alert()!.message}</p>
      </div>
      <button class="btn bg-blue-500 text-white btn-md w-fit flex mx-auto justify-center" onClick={()=>{window.location.reload()}}>Reload and Try Again</button>
       </div>
    </Show>
  );
}
