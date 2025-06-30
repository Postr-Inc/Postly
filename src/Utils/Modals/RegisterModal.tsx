import Modal from "@/src/components/Modal"
import Logo from "@/src/assets/logo.svg" 
import useTheme from "../Hooks/useTheme";
import { createEffect, createSignal } from "solid-js";
import { Match, Show, Switch } from "solid-js";
import { api } from "@/src";
import { joinClass } from "../Joinclass";
import ArrowLeft from "@/src/components/Icons/ArrowLeft";
import useNavigation from "../Hooks/useNavigation";
import { HttpCodes } from "../SDK/opCodes";
import { dispatchAlert } from "../SDK";
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
    let [businessname, setbusinessname] = createSignal(false)
    const [firstLastName, setFirstLastName] = createSignal("")
    const [isBuisnessAccount, setIsBuisinessAccount] = createSignal(false)
    let [buisnessWebsite, setBusinessWebsite] = createSignal("")
    let [postlyUse, setPostlyUse] = createSignal("")
    let [niche, setNiche] = createSignal("")
    let [loading, setLoading] = createSignal(false);
    function checkEmailandUsername() {
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
            console.log("checking")
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

     async function register() {
  const sanitizedUsername = username().replace(/\s+/g, "_");
   setLoading(true);

  try {
    const res = await fetch(`${api.serverURL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email(),
        password: password(),
        username: sanitizedUsername,
        isEarlyUser: true,
        dob: isBuisnessAccount() ? new Date().toDateString() : dob(),
        isBusinessAccount: isBuisnessAccount(),
        first_last_name: firstLastName(),
        social: buisnessWebsite(),
        niche: niche(),
        postlyUse: postlyUse()
      })
    });

    const result = await res.json();
    if (result.status !== HttpCodes.OK) {
      dispatchAlert({
        type: "error",
        message: result?.message || "Registration failed. Please try again."
      });
      return false;
    }

    dispatchAlert({
      type: "success",
      message: "Account created successfully!"
    });

    return true;
  } catch (error) {
    dispatchAlert({
      type: "error",
      message: error instanceof Error ? error.message : String(error)
    });
    return false;
  } finally {
    setLoading(false);
  }
}

    return (
        <Modal id="register" className={
            joinClass(" xl:w-[600px] focus:outline-none xl:h-[800px] md:w-[600px] self-center w-full h-full flex flex-col mx-auto xl:mt-12 md:mt-12 md:rounded-xl xl:rounded-xl",
                theme() == "dark" ? "bg-black" : ""
            )
        } >
            <Modal.Content className={
                joinClass("xl:w-[600px] xl:h-[600px] relative  md:w-[600px] md:h-1/2 w-full h-full", theme() == "dark" ? "bg-black" : "")
            }>
                <div class="flex justify-between p-2">
                    <Switch>
                        <Match when={stages() === 1}>
                            <button onClick={() => document.getElementById("register")?.close()} class="  text-lg w-6 h-6 size-6 focus:outline-none  p-2">X</button>
                        </Match>
                        <Match when={stages() === 2}>
                            <button>

                                <ArrowLeft onClick={() => setStages(1)} class="w-6 h-6 size-6   " />
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
                <Show when={stages() === 1 && !isBuisnessAccount()}>
                    <div class="flex flex-col p-5 mt-2 gap-5">
                        <h1 class="flex  font-bold text-2xl  ">Join the community! Empowering open source social media</h1>
                        <label>
                            {username() && userNameExists() ? <span class="text-red-500">Username already exists</span> : "Username"}
                        </label>
                        <input type="text" class="input  rounded-xl input-bordered" placeholder="Username" onInput={(e: any) => setUsername(e.target.value)} value={username()} />
                        <label>
                            Email
                        </label>
                        <input type="email" class={joinClass("input  rounded-xl input-bordered", emailExists() ? "border-red-500" : "")} placeholder="Email" onInput={(e: any) => setEmail(e.target.value)}
                            value={email()} />
                        <label>
                            {dob() && !checkDateOfBirth() ? <span class="text-red-500">You must be atleast 17 years old</span> : "Date of Birth "}
                        </label>
                        <input type="date" placeholder="Date of Birth" value={dob()} onInput={(e: any) => setDob(e.target.value)}
                            class={joinClass("input  rounded-xl input-bordered", !checkDateOfBirth() ? "border-red-500" : "")}
                        />
                        <button
                            onClick={() => {
                                if (emailExists() || !email() || !username() || !dob() || !checkDateOfBirth() || userNameExists()) {
                                    return;
                                }
                                setStages(2)
                            }}
                            disabled={emailExists() || !email() || !username() || !dob() || !checkDateOfBirth() || userNameExists()}
                            class="btn  rounded-xl btn-primary"
                        >
                            Next
                        </button>

                        <button class="btn btn-md text-white bg-blue-500  rounded-xl" onClick={() => {
                        setIsBuisinessAccount(true) 
                        setStages(1)
                        }}>Or Create A Buisiness Account</button>
                        <a href="/auth/login" class="text-blue-500 text-center">Already Have an Account? Login to continue</a>

                    </div>
                </Show>
                <Show when={stages() === 1 && isBuisnessAccount()}>
                    <div class="flex flex-col p-5 mt-2 gap-5">
                        <h1 class="flex  font-bold text-2xl  ">Grow your Brand With Postly!</h1>
                        <label>
                            {username() && userNameExists() ? <span class="text-red-500">Buisness Name already exists</span> : "Business Name"}
                        </label>
                        <input type="text" class="input  rounded-xl input-bordered" placeholder="Business Name" onChange={(e: any) => setUsername(e.target.value)} value={username()} />
                        <label>
                            First and Last Name
                        </label>
                        <input type="text" class="input  rounded-xl input-bordered" placeholder="Full name" onChange={(e: any) => setFirstLastName(e.target.value)} value={firstLastName()} />
                        <label>
                            Business Email
                        </label>
                        <input type="email" class={joinClass("input  rounded-xl input-bordered", emailExists() ? "border-red-500" : "")} placeholder="Email" onInput={(e: any) => setEmail(e.target.value)}
                            value={email()} />

                        <label>
                           Account Password
                        </label>
                        <input type="password" minLength={8}   placeholder="Password" class={joinClass("input  rounded-xl input-bordered")}  onInput={(e: any) => setPassword(e.target.value)}
                            value={password()} />

                        <button
                            onClick={() => {
                                if (emailExists() || !email() || !firstLastName() || userNameExists() ||!password()) {
                                    return;
                                }
                                setStages(2)
                            }}
                            disabled={emailExists() || !email() || !firstLastName() || userNameExists() || !password()}
                            class="btn  rounded-xl btn-primary"
                        >
                            Next
                        </button>

                        <a href="/auth/login" class="text-blue-500 text-center">Already Have an Account? Login to continue</a>

                    </div>
                </Show>
                <Show when={stages() === 2 && isBuisnessAccount()}>
                    <div class="flex flex-col p-5 mt-2 gap-5">
                        <h1 class="flex  font-bold text-2xl  ">Lets Setup More Details!</h1>
                        <label>
                            Website
                        </label>
                        <input type="text" class="input  rounded-xl input-bordered" placeholder="Website Url" onInput={(e: any) => setBusinessWebsite(e.target.value)} value={buisnessWebsite()} />
                        <label>
                            Industry & Niche
                        </label>
                        <select class="select  rounded-xl  border" onInput={(e) => setNiche(e.currentTarget.value)}>
                            <option disabled selected>Choose your company's niche</option>
                            <option>Tech startups</option>
                            <option>Personal brands</option>
                            <option>Indie SaaS companies</option>
                            <option>Coaching businesses</option>
                            <option>Digital product sellers</option>
                            <option>Content creators</option>
                            <option>Design studios</option>
                            <option>Dev agencies</option>
                            <option>Lifestyle brands</option>
                            <option>Online educators</option>
                            <option>Wellness brands</option>
                            <option>Mental health services</option>
                            <option>Solopreneurs</option>
                            <option>E-commerce shops</option>
                            <option>Marketing agencies</option>
                            <option>Community-led platforms</option>
                            <option>Newsletters</option>
                            <option>Bootstrapped businesses</option>
                            <option>No-code app builders</option>
                            <option>Local businesses</option>
                            <option>Personal development brands</option>
                            <option>Productivity toolmakers</option>
                            <option>Crypto/Web3 projects</option>
                            <option>AI tool builders</option>
                            <option>Open source projects</option>
                            <option>Boutique studios</option>
                            <option>Subscription businesses</option>
                            <option>Niche media companies</option>
                        </select>

                        <label>
                            How do you plan to use postly?
                        </label>
                        <div>
                            <label class="flex gap-2">
                                <input type="radio" name="postlyUse" class="radio rounded-full" value="Engage with a community" onInput={(e) => setPostlyUse(e.currentTarget.value)} />
                                Engage with a community
                            </label>
                        </div>
                        <div>
                            <label class="flex gap-2">
                                <input type="radio" name="postlyUse" class="radio rounded-full" value="Build a brand presence" onInput={(e) => setPostlyUse(e.currentTarget.value)} />
                                Build a brand presence
                            </label>
                        </div>
                        <div>
                            <label class="flex gap-2">
                                <input type="radio" name="postlyUse" class="radio rounded-full" value="Post personally under a founder or team voice" onInput={(e) => setPostlyUse(e.currentTarget.value)} />
                                Post personally under a founder or team voice
                            </label>
                        </div>
                        <div>
                            <label class="flex gap-2">
                                <input type="radio" name="postlyUse" class="radio rounded-full" value="Still figuring it out" onInput={(e) => setPostlyUse(e.currentTarget.value)} />
                                Still figuring it out
                            </label>
                        </div>

                        <button
                            onClick={async () => {
                                if (!buisnessWebsite() || !postlyUse() || !niche()) {
                                    return;
                                }
                                await register() 
                                setStages(3)
                            }}
                            disabled={!buisnessWebsite() || !postlyUse() || !niche()}
                            class="btn   rounded-xl btn-primary"
                        >
                            Next
                        </button>


                    </div>
                </Show>
                <Show when={stages() === 3 && isBuisnessAccount()}>
                    <div class="flex flex-col p-5 mt-2 gap-5">
                        <h1 class="font-bold text-2xl">Success!</h1>
                        <p>Your business account is ready to go.</p>

                        <button
                            onClick={async () => {
                                if (!buisnessWebsite() || !postlyUse() || !niche()) {
                                    return;
                                }

                                try { 
                                    navigate("/auth/login") 
                                    document.getElementById("register").close();
                                } catch (error) {
                                    console.error("Login failed:", error);
                                }
                            }}
                            disabled={!buisnessWebsite() || !postlyUse() || !niche()}
                            class="btn btn-primary rounded-full"
                        >
                            Start
                        </button>
                    </div>
                </Show>

                <Show when={stages() === 2 && !isBuisnessAccount()}>
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
                            onClick={async () => {
                                if (!password() || !confirmPassword() || password() !== confirmPassword() || password().length < 8) {
                                    return;
                                }
                                await register()
                                try {
                                    console.log(email(), username(), password())
                                    await api.authStore.login(email(), password());
                                    if(window.location.pathname == "/"){
                                        window.location.reload()
                                    }else{
                                        navigate("/")
                                    } 
                                    //@ts-ignore
                                    document.getElementById("register").close();
                                } catch (error) {
                                    console.error("Login failed:", error);
                                }
                            }}
                            disabled={!password() || !confirmPassword() || password() !== confirmPassword() || password().length < 8}
                        >{loading()  ? "Registering..." : "Register"}</button>
                    </div>

                </Show>
            </Modal.Content>

        </Modal>
    )
}
