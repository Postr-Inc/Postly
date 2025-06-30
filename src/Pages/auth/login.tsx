import { A } from "@solidjs/router";
import { createEffect, createSignal, Show, } from "solid-js";
import useAuth from "../../Utils/Hooks/useAuth";
import { api } from "../..";
import Page from "@/src/Utils/Shared/Page";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import logo from "@/src/assets/icon_transparent.png";
import LandingPage from "@/src/assets/Landing Page.jpg"
import { joinClass } from "@/src/Utils/Joinclass";
import useTheme from "@/src/Utils/Hooks/useTheme";
import useDevice from "@/src/Utils/Hooks/useDevice";
import Modal from "@/src/components/Modal";
import RegisterModal from "@/src/Utils/Modals/RegisterModal";
import { Portal } from "solid-js/web";
import { dispatchAlert, haptic } from "@/src/Utils/SDK";
import Alert from "@/src/Utils/Alerts/Alert"
export default function Login() {
  const { navigate } = useNavigation()
  const [isAuthenticated, setIsAuthenticated] = createSignal(
    api.authStore.isValid()
  );
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [emailError, setEmailError] = createSignal<string | null>(null);
  const [passwordError, setPasswordError] = createSignal<string | null>(null);

  const login = async () => {
    setEmailError(null);
    setPasswordError(null);

    try {
      setIsLoading(true);

      await api.authStore.login(email(), password());

      setIsAuthenticated(true);
      navigate("/");
      haptic.confirm();
    } catch (err: any) {
      // If Zod error, show field errors
      console.log(error)
      if (err?.error?.issues) {
        err.error.issues.forEach((issue: any) => {
          const field = issue.path[0];
          const message = issue.message;

          if (field === "emailOrUsername" || message === "Invalid email or password") setEmailError(message === "Invalid email or password" ? "Invalid Email" : message);
          if (field === "password" || message === "Invalid email or password") setPasswordError(message === "Invalid email or password" ? "Invalid Password" : message);
          else dispatchAlert({ type: "error", message });
        });
        haptic.error();
        return;
      }

      // Fallback for non-validation errors
      dispatchAlert({ type: "error", message: err?.message || "Login failed." });
      haptic.error();
    } finally {
      setIsLoading(false);
    }
  };



  let [email, setEmail] = createSignal("");
  let [password, setPassword] = createSignal("");

  createEffect(() => {
    if (isAuthenticated()) {
    }

    let typingTimeout: any;

    function startTyping() {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      } 

    }

    function stopTyping() {
      clearTimeout(typingTimeout); 
    }

    async function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Enter") { 
        await login(); 
      }
      startTyping();
    }

    function handleClick() {
      stopTyping();
    }

    // Attach event listeners
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("click", handleClick);
  });
  return (
    <>
      <Alert />
      <div style={{ "background-image": `url(${LandingPage})`, "background-size": "cover", "background-position": "center" }} class="w-full h-screen flex justify-center items-center">
        <div


          class=" relative w-full p-2 xl:mt-5    justify-center flex flex-col gap-5 mx-auto xl:w-[30vw] lg:w-[50vw]">
          <img src={logo} class="w-20 h-20 mx-auto  " />
          <div class=" mb-12 flex flex-col gap-5  w-full">
            <p class=" mt-2  sm:mt-0  w-full text-3xl text-white font-extrabold  theme:text-black">
              Open Source Is Simply Better.
            </p>
            <p class="text-lg text-white">
              Join the community building a safer, more secure social space.
            </p>
          </div>
          <label for="email" class="text-white">Email or Username</label>
          <div class="relative w-full">
            <input
              id="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              type="text"
              class="input rounded input-bordered w-full"
            />
            <Show when={emailError()}>
              <p class="text-red-500 text-xs">{emailError()}</p>
            </Show>

          </div>
          <label for="password" class="text-white">Password</label>

          <input
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            type="password"
            class="input rounded input-bordered w-full"
          />
          <Show when={passwordError()}>
            <p class="text-red-500 text-xs">{passwordError()}</p>
          </Show>

          <button
            onClick={() => {
              login();
            }}
            class="btn  text-white rounded border-none hover:bg-[#754aff] bg-rose-500 relative"
          >
            {isLoading() ? "Loading..." : "Sign in"}
          </button>

          {
            error() && "error"
          }
          <p class="text-xs text-white">
            Forgot your password?{" "}
            <button
              onClick={() => navigate("/auth/ForgotPassword", null)}
              class="text-blue "
            >
              Reset it
            </button>
          </p>
          <div class="text-white">
            <p class="text-xs">
              Don't have an account?{" "}
              <button
                onClick={() => (document.getElementById("register") as HTMLDialogElement | null)?.showModal()}
                class="text-blue-500"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
        <Portal>
          <RegisterModal />
        </Portal>
      </div>
    </>
  );
}
