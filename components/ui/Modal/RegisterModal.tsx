import Modal from "@/components/ui/Modal";
import Logo from "@/src/assets/logo.svg";
import useTheme from "../../../src/Utils/Hooks/useTheme";
import { createEffect, createSignal } from "solid-js";
import { Match, Show, Switch } from "solid-js";
import { api } from "@/src";
import { joinClass } from "../../../src/Utils/Joinclass";
import ArrowLeft from "@/components/Icons/ArrowLeft";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import { HttpCodes } from "@/src/Utils/SDK/opCodes";
import { dispatchAlert } from "@/src/Utils/SDK";

export default function RegisterModal() {
  const { navigate } = useNavigation();
  const { theme } = useTheme();

  const [stage, setStage] = createSignal(1);
  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [dob, setDob] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [emailExists, setEmailExists] = createSignal(false);

  const [userNameExists, setUserNameExists] = createSignal(false);

  const [firstLastName, setFirstLastName] = createSignal("");
  const [isBusinessAccount, setIsBusinessAccount] = createSignal(false);
  const [businessWebsite, setBusinessWebsite] = createSignal("");
  const [postlyUse, setPostlyUse] = createSignal("");
  const [niche, setNiche] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  // ✅ debounce check

  const [usernameError, setUsernameError] = createSignal<string | null>(null);
  const [emailError, setEmailError] = createSignal<string | null>(null);

  async function checkEmailandUsername() {
    const emailValue = email()?.trim();
    const usernameValue = username()?.trim();

    // Clear previous errors on new check
    setEmailError(null);
    setUsernameError(null);

    if (!emailValue && !usernameValue) {
      setEmailError("Please enter an email");
      setUsernameError("Please enter a username");
      return false;
    }

    setLoading(true);

    try {
      const res = await fetch(`${api.serverURL}/auth/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue || undefined,
          username: usernameValue || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.status !== 200) {
        // If backend returned Zod validation errors
        if (result?.errors && Array.isArray(result.errors)) {
          for (const err of result.errors) {
            if (err.path.includes("email")) {
              setEmailError(err.message);
            }
            if (err.path.includes("username")) {
              setUsernameError(err.message);
            }
          }
        } else {
          // Fallback error - you can handle global errors here if needed
          dispatchAlert({
            type: "error",
            message: result?.message || "Validation failed.",
          });
        }
        return false;
      }

      // Clear errors if check passes
      setEmailError(null);
      setUsernameError(null);

      setEmailExists(result.data.emailExists);
      setUserNameExists(result.data.usernameExists);

      setTimeout(() => {
        setEmailExists(false);
        setUserNameExists(false);
      }, 2000);

      return !result.data.emailExists && !result.data.usernameExists;
    } catch (error) {
      dispatchAlert({
        type: "error",
        message: "Could not check email or username. Try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  function checkDateOfBirth() {
    const _dob = new Date(dob());
    return new Date().getFullYear() - _dob.getFullYear() >= 17;
  }

  async function register() {
    setLoading(true);
    const payload = {
      email: email(),
      password: password(),
      username: username().replace(/\s+/g, "_"),
      isBusinessAccount: isBusinessAccount(),
      dob: isBusinessAccount() ? undefined : dob(),
      first_last_name: firstLastName(),
      social: businessWebsite(),
      niche: niche(),
      postlyUse: postlyUse(),
    };

    const res = await fetch(`${api.serverURL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());

    if (res.status !== HttpCodes.OK) {
      dispatchAlert({
        type: "error",
        message: res.message || "Registration failed.",
      });
    } else {
      dispatchAlert({ type: "success", message: "Account created!" });
    }
    setLoading(false);
    return res.status === HttpCodes.OK;
  }

  function canProceedStage1() {
    return (
      email() &&
      username() &&
      !emailExists() &&
      !userNameExists() &&
      checkDateOfBirth()
    );
  }

  return (
    <Modal
      id="register"
      className={joinClass(
        " xl:w-[600px] focus:outline-none xl:h-[800px] md:w-[600px] self-center w-full h-full flex flex-col mx-auto xl:mt-12 md:mt-12 md:rounded-xl xl:rounded-xl",
        theme() == "dark" ? "bg-black" : "",
      )}
    >
      <Modal.Content
        className={joinClass(
          "xl:w-[600px] xl:h-[600px] relative  md:w-[600px] md:h-1/2 w-full h-full",
          theme() == "dark" ? "bg-black" : "",
        )}
      >
        <div class="flex justify-between p-2">
          <Switch>
            <Match when={stage() === 1}>
              <button
                onClick={() => {
                  document.getElementById("register")?.close();
                  setStage(1);
                  setBusinessWebsite("");
                  setUserNameExists(false);
                  setConfirmPassword("");
                  setIsBusinessAccount(false);
                  setFirstLastName("");
                  setDob("");
                  setEmail("");
                  setNiche("");
                  setPassword("");
                  setPostlyUse("");
                }}
                class="  text-lg w-6 h-6 size-6 focus:outline-none  p-2"
              >
                X
              </button>
            </Match>
            <Match when={stage() === 2}>
              <button>
                <ArrowLeft
                  onClick={() => setStage(1)}
                  class="w-6 h-6 size-6   "
                />
              </button>
            </Match>
          </Switch>
          <Switch>
            <Match when={theme() === "light"}>
              <img
                src="/icons/icon_transparent.png"
                class="w-12 h-12 xl:w-20 xl:h-20 black"
              />
            </Match>
            <Match when={theme() === "dark"}>
              <img src="/icons/icon_transparent.png" class="w-20 h-20" />
            </Match>
          </Switch>
          <div></div>
        </div>

        {/* STAGE 1 */}
        <Show when={stage() === 1 && !isBusinessAccount()}>
          <div class="p-5 flex flex-col gap-5">
            <h1 class="text-2xl font-bold">Join Postly</h1>
            <label>
              {userNameExists() ? (
                <span class="text-red-500">Username taken</span>
              ) : (
                "Username"
              )}
            </label>
            <input
              type="text"
              value={username()}
              onInput={(e) => setUsername(e.currentTarget.value)}
              class={joinClass(
                "input input-bordered rounded-xl placeholder:input-bordered",
                usernameError() ? "border-red-500" : "",
              )}
            />
            {usernameError() && (
              <p class="text-red-500 text-sm mt-1">{usernameError()}</p>
            )}
            <label>
              {emailExists() ? (
                <span class="text-red-500">
                  Email already has an account linked
                </span>
              ) : (
                "Email"
              )}
            </label>
            <input
              type="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class={joinClass(
                "input rounded-xl input-bordered",
                emailError() ? "border-red-500" : "",
              )}
            />
            {emailError() && (
              <p class="text-red-500 text-sm mt-1">{emailError()}</p>
            )}
            <label>Date of Birth</label>
            <input
              type="date"
              class="input rounded-xl input-bordered"
              value={dob()}
              onInput={(e) => setDob(e.target.value)}
            />
            {!checkDateOfBirth() && dob() && (
              <p class="text-red-500">You must be at least 17.</p>
            )}
            <button
              class="btn rounded-xl btn-primary"
              disabled={!canProceedStage1()}
              onClick={async () => {
                if (await checkEmailandUsername()) {
                  setStage(2);
                } else {
                  dispatchAlert({
                    type: "error",
                    message: " Issue creating user account",
                  });
                }
              }}
            >
              {loading() ? "Checking Credentials" : "Next"}
            </button>
            <button
              class="bg-blue-500  btn btn-md rounded-xl text-white"
              onClick={() => {
                setIsBusinessAccount(true);
              }}
            >
              Or Register Business
            </button>
            <a href="/auth/login" class="text-center">
              Already have an account?
            </a>
          </div>
        </Show>

        {/* STAGE 2 - Personal */}
        <Show when={stage() === 2 && !isBusinessAccount()}>
          <div class="p-5 flex flex-col gap-5">
            <label>Password</label>
            <input
              type="password"
              class="input rounded-xl input-bordered"
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
            />
            <label>Confirm Password</label>
            <input
              type="password"
              class="input  rounded-xl input-bordered"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.target.value)}
            />
            {password() !== confirmPassword() && (
              <p class="text-red-500">Passwords do not match</p>
            )}
            <button
              class="btn btn-primary"
              disabled={
                password().length < 8 || password() !== confirmPassword()
              }
              onClick={async () => {
                if (await register()) {
                  navigate("/auth/login");
                  document.getElementById("register")?.close();
                }
              }}
            >
              {loading() ? "Registering..." : "Register"}
            </button>
          </div>
        </Show>

        {/* STAGE 1 - Business */}
        <Show when={stage() === 1 && isBusinessAccount()}>
          <div class="p-5 flex flex-col gap-5">
            <label>Business Name</label>
            <input
              class="input  rounded-xlinput-bordered"
              value={username()}
              onInput={(e) => setUsername(e.target.value)}
            />
            <label>Owner Name</label>
            <input
              class="input rounded-xl input-bordered"
              value={firstLastName()}
              onInput={(e) => setFirstLastName(e.target.value)}
            />
            <label>Business Email</label>
            <input
              class="input rounded-xl input-bordered"
              value={email()}
              onInput={(e) => setEmail(e.target.value)}
            />
            <label>Password</label>
            <input
              type="password"
              class="input rounded-xl input-bordered"
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
            />
            <button
              class="btn rounded-xl btn-primary"
              disabled={
                !username() || !firstLastName() || !email() || !password()
              }
              onClick={() => setStage(2)}
            >
              Next
            </button>
          </div>
        </Show>

        {/* STAGE 2 - Business */}
        <Show when={stage() === 2 && isBusinessAccount()}>
          <div class="p-5 flex flex-col gap-5">
            <label>Website</label>
            <input
              class="input rounded-xl input-bordered"
              value={businessWebsite()}
              onInput={(e) => setBusinessWebsite(e.target.value)}
            />
            <label>Niche</label>
            <select
              class="select"
              value={niche()}
              onInput={(e) => setNiche(e.currentTarget.value)}
            >
              <option disabled selected>
                Select Niche
              </option>
              <option>Tech</option>
              <option>Creator</option>
              {/* etc... */}
            </select>
            <label>How will you use Postly?</label>
            <input
              class="input rounded-xl  input-bordered"
              value={postlyUse()}
              onInput={(e) => setPostlyUse(e.target.value)}
            />
            <button
              class="btn rounded-xl btn-primary"
              disabled={!businessWebsite() || !niche() || !postlyUse()}
              onClick={async () => {
                if (await register()) {
                  navigate("/auth/login");
                  document.getElementById("register")?.close();
                }
              }}
            >
              {loading() ? "Registering..." : "Register"}
            </button>
          </div>
        </Show>
      </Modal.Content>
    </Modal>
  );
}
