import { A } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import useAuth from "../../Utils/Hooks/useAuth";
import { api } from "../..";
import Page from "@/components/ui/Page";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import logo from "@/src/assets/icon_transparent.png";
import LandingPage from "@/src/assets/Landing Page.jpg";
import { joinClass } from "@/src/Utils/Joinclass";
import useTheme from "@/src/Utils/Hooks/useTheme";
import useDevice from "@/src/Utils/Hooks/useDevice";
import Modal from "@/components/ui/Modal";
import RegisterModal from "@/components/ui/Modal/RegisterModal";
import { Portal } from "solid-js/web";
import { dispatchAlert, haptic } from "@/src/Utils/SDK";
import Alert from "@/components/ui/Alerts/Alert";
import Eye from "@/components/Icons/Eye";
import EyeOff from "@/components/Icons/EyeOff";
export default function Login() {
  const { navigate } = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = createSignal(
    api.authStore.isValid(),
  );
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [emailError, setEmailError] = createSignal<string | null>(null);
  const [passwordError, setPasswordError] = createSignal<string | null>(null);
  const [showPassword, setShowPassword] = createSignal(false);
  const [rememberMe, setRememberMe] = createSignal(false);

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
      console.log(error);
      if (err?.error?.issues) {
        err.error.issues.forEach((issue: any) => {
          const field = issue.path[0];
          const message = issue.message;

          if (
            field === "emailOrUsername" ||
            message === "Invalid email or password"
          )
            setEmailError(
              message === "Invalid email or password"
                ? "Invalid Email"
                : message,
            );
          if (field === "password" || message === "Invalid email or password")
            setPasswordError(
              message === "Invalid email or password"
                ? "Invalid Password"
                : message,
            );
          else dispatchAlert({ type: "error", message });
        });
        haptic.error();
        return;
      }

      // Fallback for non-validation errors
      dispatchAlert({
        type: "error",
        message: err?.message || "Login failed.",
      });
      haptic.error();
    } finally {
      setIsLoading(false);
    }
  };

  let [email, setEmail] = createSignal("");
  let [password, setPassword] = createSignal("");

  // Real-time validation functions
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    }
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  // Enhanced login function with better validation
  const handleLogin = async () => {
    const isEmailValid = validateEmail(email());
    const isPasswordValid = validatePassword(password());
    
    if (!isEmailValid || !isPasswordValid) {
      haptic.error();
      return;
    }
    
    await login();
  };

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
        await handleLogin();
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
      <div
        style={{
          "background-image": `url(${LandingPage})`,
          "background-size": "cover",
          "background-position": "center",
        }}
        class="w-full min-h-screen flex justify-center items-center p-4 sm:p-6"
      >
        <div class="relative w-full max-w-md">
          {/* Glassmorphism effect container */}
          <div class="backdrop-blur-lg bg-white/10 dark:bg-black/20 rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 animate-fade-in">
            {/* Logo and Header */}
            <div class="text-center mb-6 sm:mb-8">
              <img 
                src={logo} 
                alt="Postly Logo" 
                class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 drop-shadow-lg"
              />
              <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p class="text-white/80 text-xs sm:text-sm">
                Join the community building a safer, more secure social space.
              </p>
            </div>

            {/* Login Form */}
            <form class="space-y-4 sm:space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              {/* Email Input */}
              <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-white/90">
                  Email or Username
                </label>
                <div class="relative">
                  <input
                    id="email"
                    type="email"
                    value={email()}
                    onInput={(e) => {
                      setEmail(e.currentTarget.value);
                      validateEmail(e.currentTarget.value);
                    }}
                    onBlur={() => validateEmail(email())}
                    class={joinClass(
                      "input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-200",
                      emailError() ? "border-red-400 focus:border-red-400" : ""
                    )}
                    placeholder="Enter your email"
                    disabled={isLoading()}
                    aria-invalid={emailError() ? "true" : "false"}
                    aria-describedby={emailError() ? "email-error" : undefined}
                  />
                  <Show when={emailError()}>
                    <p id="email-error" class="text-red-400 text-xs mt-1 animate-fade-in">
                      {emailError()}
                    </p>
                  </Show>
                </div>
              </div>

              {/* Password Input */}
              <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-white/90">
                  Password
                </label>
                <div class="relative">
                  <input
                    id="password"
                    type={showPassword() ? "text" : "password"}
                    value={password()}
                    onInput={(e) => {
                      setPassword(e.currentTarget.value);
                      validatePassword(e.currentTarget.value);
                    }}
                    onBlur={() => validatePassword(password())}
                    class={joinClass(
                      "input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-200 pr-12",
                      passwordError() ? "border-red-400 focus:border-red-400" : ""
                    )}
                    placeholder="Enter your password"
                    disabled={isLoading()}
                    aria-invalid={passwordError() ? "true" : "false"}
                    aria-describedby={passwordError() ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword())}
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 hover:text-white transition-colors"
                    aria-label={showPassword() ? "Hide password" : "Show password"}
                  >
                    <Show when={showPassword()} fallback={<Eye class="w-5 h-5" />}>
                      <EyeOff class="w-5 h-5" />
                    </Show>
                  </button>
                  <Show when={passwordError()}>
                    <p id="password-error" class="text-red-400 text-xs mt-1 animate-fade-in">
                      {passwordError()}
                    </p>
                  </Show>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div class="flex items-center justify-between">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe()}
                    onChange={(e) => setRememberMe(e.currentTarget.checked)}
                    class="checkbox checkbox-sm checkbox-primary bg-white/10 border-white/20"
                    disabled={isLoading()}
                  />
                  <span class="text-sm text-white/80">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/auth/reset-password", null)}
                  class="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                  disabled={isLoading()}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading()}
                class={joinClass(
                  "btn w-full border-none text-white font-medium transition-all duration-200 relative overflow-hidden",
                  isLoading() 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 opacity-80 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg"
                )}
              >
                <Show when={isLoading()} fallback="Sign In">
                  <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                </Show>
              </button>
            </form>

         

            {/* Sign Up Link */}
            <div class="text-center mt-6">
              <p class="text-sm text-white/80">
                Don't have an account?{" "}
                <button
                  onClick={() =>
                    (
                      document.getElementById(
                      "register",
                    ) as HTMLDialogElement | null
                  )?.showModal()
                }
                  class="text-blue-300 hover:text-blue-200 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Error Display */}
            <Show when={error()}>
              <div class="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p class="text-red-300 text-sm text-center">{error()}</p>
              </div>
            </Show>
          </div>
        </div>
        <Portal>
          <RegisterModal />
        </Portal>
      </div>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>
    </>
  );
}
