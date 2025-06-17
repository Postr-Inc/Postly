import Modal from "@/src/components/Modal"
import Logo from "@/src/assets/logo.svg"
import useTheme from "../Hooks/useTheme";
import { createEffect, createSignal } from "solid-js";
import { Match, Show, Switch } from "solid-js";
import { api } from "@/src";
import { joinClass } from "../Joinclass";
import ArrowLeft from "@/src/components/Icons/ArrowLeft";
import useNavigation from "../Hooks/useNavigation";
export default function RegisterModal() {
    const { route, navigate } = useNavigation();
    let { theme } = useTheme();
    let [stages, setStages] = createSignal(1);
    let [username, setUsername] = createSignal("");
    let [email, setEmail] = createSignal("");
    let [password, setPassword] = createSignal("");
    let [dob, setDob] = createSignal("");
    let [confirmPassword, setConfirmPassword] = createSignal("");
    let [emailExists, setEmailExists] = createSignal(false);
    let [userNameExists, setUserNameExists] = createSignal(false);
    function checkEmailandUsername() {
        // Check if email exists 
        console.log(api.serverURL)
        fetch(`${api.serverURL}/auth/check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email(), username: username() })
        }).then(res => res.json()).then(res => {
            let { data } = res;  
            setEmailExists(data.emailExists);
            setUserNameExists(data.usernameExists);
        })
    }

    createEffect(() => {
        // wait until user stops typing
        let timeout: any;
        if (email() || username()) {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                checkEmailandUsername();
            }, 1000)
        }

    });
    function checkDateOfBirth() {
        // Check if date of birth is valid ie atleast 17
        let _dob = new Date(dob());
        let today = new Date();
        let diff = today.getFullYear() - _dob.getFullYear();
        if (diff < 17) {
            return false;
        }
        return true;
    }

    function register() {
        fetch(`${api.serverURL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email(),
                password: password(),
                username: username(),
                dob: dob()
            })
        }).then(res => res.json()).then(async res => {
             document.getElementById("register")?.remove();
              api.authStore.login(email(), password()).then(res => { 
                    navigate("/", null)
              })
             
        })
    }
    return (
        <Modal id="register" className=" xl:w-[600px] focus:outline-none xl:h-[700px] md:w-[600px] self-center w-full h-full flex flex-col mx-auto xl:mt-12 md:mt-12 md:rounded-xl xl:rounded-xl"  >
            <Modal.Content className="xl:w-[600px] xl:h-[600px] relative  md:w-[600px] md:h-1/2 w-full h-full">
                <div class="flex justify-between p-2">
                     <Switch>
                        <Match when={stages() === 1}>
                            <button onClick={() => document.getElementById("register")?.close()} class="  text-lg w-6 h-6 size-6  p-2">X</button>
                        </Match>
                        <Match when={stages() === 2}>
                            <button>
                                
                            <ArrowLeft onClick={() => setStages(1)}  class="w-6 h-6 size-6   " />
                            </button>
                        </Match>
                     </Switch>
                    <Switch>
                        <Match when={theme() === "light"}>
                            <img src="/icons/icon_transparent.png" class="w-12 h-12 xl:w-20 xl:h-20 black" />
                        </Match>
                        <Match when={theme() === "dark"}>
                            <img src="/icons/icon_transparent.png" class="w-20 h-20" />
                        </Match>
                    </Switch>
                    <div></div>
                </div>
                <Show when={stages() === 1}>
                    <div class="flex flex-col p-5 mt-2 gap-5">
                        <h1 class="flex  font-bold text-2xl  ">Join the community! Empowering open source social media</h1>
                        <label>
                            {username() && userNameExists() ? <span class="text-red-500">Username already exists</span> : "Username"}
                        </label>
                        <input type="text" class="input input-bordered" placeholder="Username" onInput={(e: any) => setUsername(e.target.value)} value={username()} />
                        <label>
                            Email
                        </label>
                        <input type="email" class={joinClass("input input-bordered", emailExists() ? "border-red-500" : "")} placeholder="Email" onInput={(e: any) => setEmail(e.target.value)}
                            value={email()} />
                        <label>
                             {dob() && !checkDateOfBirth() ? <span class="text-red-500">You must be atleast 17 years old</span> : "Date of Birth "}
                        </label>
                        <input type="date"   placeholder="Date of Birth"  value={dob()} onInput={(e: any) => setDob(e.target.value)}
                        class={joinClass("input input-bordered", !checkDateOfBirth() ? "border-red-500" : "")}
                        />
                        <button
                            onClick={() => {
                                if (emailExists()  || !email() || !username() || !dob() || !checkDateOfBirth() || userNameExists()) {
                                    return;
                                }
                                setStages(2)
                            }} 
                            disabled={emailExists() || !email() || !username() || !dob() || !checkDateOfBirth() || userNameExists()}
                            class="btn rounded-full btn-primary"
                        >
                            Next
                        </button>

                          <a href="/auth/login" class="text-blue-500">Already Have an Account? Login to continue</a>

                    </div>
                </Show>
                <Show when={stages() === 2}>
                    <div class="flex flex-col p-5 mt-2 gap-5">
                        <h1 class="flex  font-bold text-2xl  ">Create Your Account</h1>
                        <label>
                            {password() && password().length < 8 ? <span class="text-red-500">Password must be atleast 8 characters</span> : "Password"}
                        </label>
                        <input type="password" class="input input-bordered" placeholder="Password" onInput={(e: any) => setPassword(e.target.value)} value={password()} />
                        <label>
                            Confirm Password
                        </label>
                        <input type="password" class="input input-bordered" placeholder="Confirm Password" onInput={(e: any) => setConfirmPassword(e.target.value)} value={confirmPassword()} />
                        <button class="btn rounded-full  bg-blue-500 text-white"
                        onClick={()=>{
                            if(!password() || !confirmPassword() || password() !== confirmPassword() || password().length < 8){
                                return;
                            }
                            register()
                        }}
                        disabled={!password() || !confirmPassword() || password() !== confirmPassword() || password().length < 8}
                        >Register</button>
                    </div>

                </Show>
            </Modal.Content>
           
        </Modal>
    )
}
