"use client"

import { api } from "@/src"
import useTheme from "@/src/Utils/Hooks/useTheme"
import { joinClass } from "@/src/Utils/Joinclass"
import { createSignal, createEffect, Switch, Match, Show, For } from "solid-js"

// Icon Components
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
      clipRule="evenodd"
    />
  </svg>
)

const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    class="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
    />
  </svg>
)

const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    class="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
)

// Validation functions
const validateUsername = (username: string) => {
  if (!username.trim()) return "Username is required"
  if (username.length < 3) return "Username must be at least 3 characters"
  if (username.length > 20) return "Username must be less than 20 characters"
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores"
  return null
}

const validateBio = (bio: string) => {
  if (bio.length > 160) return "Bio must be less than 160 characters"
  return null
}

const validateLocation = (location: string) => {
  if (location.length > 50) return "Location must be less than 50 characters"
  return null
}

const validateSocial = (social: string) => {
  if (social && social.length > 100) return "Social link must be less than 100 characters"
  return null
}

export default function EditProfileModal({
  updateUser,
}: {
  updateUser: (data: any) => void
}) {
  const { theme } = useTheme()

  if (!api.authStore.model.username) return <div></div>

  // Form state
  const [avatar, setAvatar] = createSignal(api.authStore.model.avatar)
  const [avatarFile, setAvatarFile] = createSignal<File>()
  const [bannerFile, setBannerFile] = createSignal<File>()
  const [banner, setBanner] = createSignal(api.authStore.model.banner)
  const [username, setUsername] = createSignal(api.authStore.model.username)
  const [handle, setHandle] = createSignal(api.authStore.model.handle || "any handle name")
  const [bio, setBio] = createSignal(api.authStore.model.bio || "")
  const [location, setLocation] = createSignal(api.authStore.model.location || "")
  const [social, setSocial] = createSignal<string[]>(Array.isArray(api.authStore.model.social) ? api.authStore.model.social : [])

  const [deactivated, setDeactivated] = createSignal(api.authStore.model.deactivated)
  const validateSocial = (socialLinks: string[]) => {
    for (const link of socialLinks) {
      if (link.length > 100) return "Each link must be less than 100 characters"
      if (!/^https?:\/\//.test(link)) return "Links must start with http:// or https://"
    }
    return null
  }

  // UI state
  const [isSaving, setIsSaving] = createSignal(false)
  const [errors, setErrors] = createSignal<Record<string, string>>({})
  const [touched, setTouched] = createSignal<Record<string, boolean>>({})

  // Validation effect
  createEffect(() => {
    const newErrors: Record<string, string> = {}

    const usernameError = validateUsername(username())
    if (usernameError) newErrors.username = usernameError

    const bioError = validateBio(bio())
    if (bioError) newErrors.bio = bioError

    const locationError = validateLocation(location())
    if (locationError) newErrors.location = locationError

    const socialError = validateSocial(social())
    if (socialError) newErrors.social = socialError

    setErrors(newErrors)
  })

  const hasErrors = () => Object.keys(errors()).length > 0
  const hasChanges = () => {
    return (
      avatarFile() ||
      bannerFile() ||
      username() !== api.authStore.model.username ||
      bio() !== (api.authStore.model.bio || "") ||
      location() !== (api.authStore.model.location || "") ||
      social() !== (api.authStore.model.social || "") ||
      deactivated() !== api.authStore.model.deactivated
      || handle() !== api.authStore.model.handle
    )
  }

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function bufferFile(file: File) {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve({
          data: Array.from(new Uint8Array(reader.result as ArrayBuffer)),
          name: file.name,
          isFile: true,
        })
      }
      reader.onerror = reject
    })
  }

  async function handleFile(file: File) {
    if (file) {
      return await bufferFile(file)
    }
  }

  const handleAvatarChange = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("Avatar file size must be less than 5MB")
        return
      }
      setAvatarFile(file)
    }
  }

  const handleBannerChange = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert("Banner file size must be less than 10MB")
        return
      }
      setBannerFile(file)
    }
  }

  async function save() {
    if (hasErrors() || !hasChanges()) return

    const data: any = {}

    if (avatarFile()) data.avatar = await handleFile(avatarFile()!)
    if (bannerFile()) data.banner = await handleFile(bannerFile()!)
    if (username() !== api.authStore.model.username) data.username = username()
    if (bio() !== (api.authStore.model.bio || "")) data.bio = bio()
    if (location() !== (api.authStore.model.location || "")) data.location = location()
    if (social() !== (api.authStore.model.social || "")) data.social = social()
    if (deactivated() !== api.authStore.model.deactivated) data.deactivated = deactivated()
    if(handle() !== api.authStore.model.handle) data.handle = handle()

    if (Object.keys(data).length === 0) return

    setIsSaving(true)

    try {
      const updatedData = await api.collection("users").update(api.authStore.model.id, data, {
        invalidateCache: [`/u/user_${api.authStore.model.username}`],
      })

      setIsSaving(false)
      document.getElementById("editProfileModal")?.close()

      const oldUser = api.authStore.model
      const newUser = { ...oldUser, ...updatedData }

      api.authStore.model = newUser
      newUser.token = oldUser.token
      localStorage.setItem("postr_auth", JSON.stringify(newUser))

      // Update UI with local file URLs for immediate feedback
      const copiedData = Object.assign({}, data)
      if (copiedData.avatar && avatarFile()) {
        copiedData.avatar = URL.createObjectURL(avatarFile()!)
      }
      if (copiedData.banner && bannerFile()) {
        copiedData.banner = URL.createObjectURL(bannerFile()!)
      }

      updateUser({ ...api.authStore.model, ...copiedData })
    } catch (error) {
      setIsSaving(false)
      console.error("Failed to save profile:", error)
    }
  }

  const closeModal = () => {
    document.getElementById("editProfileModal")?.close()
  }

  return (
    <dialog id="editProfileModal" class="modal rounded-xl overflow-y-scroll scroll-smooth no-scrollbar">
      <div
        class={joinClass(
          "modal-content max-w-lg w-full mx-4    shadow-2xl   ",
          theme() === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
        )}
      >
        {/* Header */}
        <div
          class={joinClass(
            "flex items-center  justify-between p-4 border-b",
            theme() === "dark" ? "border-gray-700" : "border-gray-200",
          )}
        >
          <button
            onClick={closeModal}
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <CloseIcon />
          </button>

          <h2 class="text-lg font-semibold">Edit Profile</h2>

          <button
            onClick={save}
            disabled={isSaving() || hasErrors() || !hasChanges()}
            class={joinClass(
              "px-4 py-2 rounded-full font-medium transition-all duration-200",
              isSaving() || hasErrors() || !hasChanges()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : theme() === "dark"
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-black text-white hover:bg-gray-800",
            )}
          >
            {isSaving() ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Profile Images Section */}
        <div class="relative">
          {/* Banner */}
          <div class="relative h-32 overflow-hidden">
            <Switch>
              <Match when={bannerFile()}>
                <img
                  src={URL.createObjectURL(bannerFile()!) || "/placeholder.svg"}
                  alt="Banner preview"
                  class="w-full h-full object-cover"
                />
              </Match>
              <Match when={api.authStore.model.banner}>
                <img
                  src={
                    api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.banner) || "/placeholder.svg"
                  }
                  alt="Current banner"
                  class="w-full h-full object-cover"
                />
              </Match>
              <Match when={true}>
                <div class={joinClass("w-full h-full", theme() === "dark" ? "bg-gray-800" : "bg-gray-200")} />
              </Match>
            </Switch>

            {/* Banner upload button */}
            <label
              for="banner-upload"
              class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div class="bg-black bg-opacity-60 rounded-full p-3">
                <CameraIcon />
              </div>
            </label>
          </div>

          {/* Avatar */}
          <div class="absolute -bottom-8 left-4">
            <div class="relative">
              <div
                class={joinClass(
                  "w-20 h-20 rounded-full border-4 overflow-hidden",
                  theme() === "dark" ? "border-gray-900" : "border-white",
                )}
              >
                <Switch>
                  <Match when={avatarFile()}>
                    <img
                      src={URL.createObjectURL(avatarFile()!) || "/placeholder.svg"}
                      alt="Avatar preview"
                      class="w-full h-full object-cover"
                    />
                  </Match>
                  <Match when={api.authStore.model.avatar}>
                    <img
                      src={
                        api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.avatar) ||
                        "/placeholder.svg"
                      }
                      alt="Current avatar"
                      class="w-full h-full object-cover"
                    />
                  </Match>
                  <Match when={true}>
                    <div
                      class={joinClass(
                        "w-full h-full flex items-center justify-center text-xl font-bold",
                        theme() === "dark" ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-700",
                      )}
                    >
                      {api.authStore.model.username[0].toUpperCase()}
                    </div>
                  </Match>
                </Switch>
              </div>

              {/* Avatar upload button */}
              <label
                for="avatar-upload"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <CameraIcon />
              </label>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input type="file" id="avatar-upload" class="hidden" accept="image/*" onChange={handleAvatarChange} />
          <input type="file" id="banner-upload" class="hidden" accept="image/*" onChange={handleBannerChange} />
        </div>

        {/* Form Fields */}
        <div class="p-4 pt-12 space-y-6">
          {/* Username */}
          <div class="space-y-2">
            <label class="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username()}
              onInput={(e) => setUsername(e.currentTarget.value)}
              onBlur={() => handleFieldBlur("username")}
              class={joinClass(
                "w-full px-3 py-2  rounded-xl  border transition-colors",
                errors().username && touched().username
                  ? "border-red-500 focus:border-red-500"
                  : theme() === "dark"
                    ? "border-gray-600 bg-gray-800 focus:border-blue-500"
                    : "border-gray-300 bg-white focus:border-blue-500",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20",
              )}
              placeholder="Enter username"
            />
            <Show when={errors().username && touched().username}>
              <div class="flex items-center gap-1 text-red-500 text-sm">
                <AlertIcon />
                {errors().username}
              </div>
            </Show>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium">Handle <span class="text-sm text-gray-500">@handle</span></label>
            <input
              type="text"
              value={handle()}
              onInput={(e) => setHandle(e.currentTarget.value)}
              onBlur={() => handleFieldBlur("handle")}
              class={joinClass(
                "w-full px-3 py-2  rounded-xl  border transition-colors",
                errors().handle && touched().handle
                  ? "border-red-500 focus:border-red-500"
                  : theme() === "dark"
                    ? "border-gray-600 bg-gray-800 focus:border-blue-500"
                    : "border-gray-300 bg-white focus:border-blue-500",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20",
              )}
              placeholder="Enter a handle"
            />
            <Show when={errors().username && touched().username}>
              <div class="flex items-center gap-1 text-red-500 text-sm">
                <AlertIcon />
                {errors().username}
              </div>
            </Show>
          </div>

          {/* Bio */}
          <div class="space-y-2">
            <label class="block text-sm font-medium">
              Bio
              <span class="text-gray-500 font-normal">({bio().length}/160)</span>
            </label>
            <textarea
              value={bio()}
              onInput={(e) => setBio(e.currentTarget.value)}
              onBlur={() => handleFieldBlur("bio")}
              class={joinClass(
                "w-full  px-3 py-2  rounded-xl  border transition-colors resize-none h-20",
                errors().bio && touched().bio
                  ? "border-red-500 focus:border-red-500"
                  : theme() === "dark"
                    ? "border-gray-600 bg-gray-800 focus:border-blue-500"
                    : "border-gray-300 bg-white focus:border-blue-500",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20",
              )}
              placeholder="Tell us about yourself"
            />
            <Show when={errors().bio && touched().bio}>
              <div class="flex items-center gap-1 text-red-500 text-sm">
                <AlertIcon />
                {errors().bio}
              </div>
            </Show>
          </div>

          {/* Location */}
          <div class="space-y-2">
            <label class="block text-sm font-medium">Location</label>
            <input
              type="text"
              value={location()}
              onInput={(e) => setLocation(e.currentTarget.value)}
              onBlur={() => handleFieldBlur("location")}
              class={joinClass(
                "w-full  rounded-xl  px-3 py-2 rounded-lg border transition-colors",
                errors().location && touched().location
                  ? "border-red-500 focus:border-red-500"
                  : theme() === "dark"
                    ? "border-gray-600 bg-gray-800 focus:border-blue-500"
                    : "border-gray-300 bg-white focus:border-blue-500",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20",
              )}
              placeholder="Where are you located?"
            />
            <Show when={errors().location && touched().location}>
              <div class="flex items-center gap-1 text-red-500 text-sm">
                <AlertIcon />
                {errors().location}
              </div>
            </Show>
          </div>

          {/* Social */}

          <div class="space-y-2">
            <label class="block text-sm font-medium">Add a Social Link</label>
            <select
              class="select select-bordered rounded-xl w-full"
              value=""
              onChange={(e) => {
                const selected = e.currentTarget.value
                if (selected && !social().includes(selected)) {
                  setSocial([...social(), selected])
                }
              }}
            >
              <option disabled selected value="">Pick a network</option>
              <option value="https://twitter.com/">Twitter</option>
              <option value="https://linkedin.com/">LinkedIn</option>
              <option value="https://github.com/">GitHub</option>
              <option value={"https://instagram.com/"}>Instagram</option>
              <option value="https://facebook.com/">Facebook</option>
              <option value="https://tiktok.com/">TikTok</option>
              <option value="https://youtube.com/">YouTube</option>
              <option value="https://reddit.com/">Reddit</option>
              <option value="https://strafe.chat/">Strafe</option>
              <option value="https://discord.com/">Discord</option>
            </select>

            <div class="mt-2 space-y-1">
              <div class="mt-2 space-y-1">
                <For each={social()}>
                  {(link, index) => (
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        class="input input-bordered w-full"
                        value={link}
                        onChange={(e) => {
                          const updated = [...social()]
                          updated[index()] = e.currentTarget.value
                          setSocial(updated)
                        }}
                      />
                      <button
                        type="button"
                        class="btn btn-error btn-sm"
                        onClick={() => {
                          const updated = social().filter((_, i) => i !== index())
                          setSocial(updated)
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>

          {/* Account Deactivation */}
          <div
            class={joinClass(
              "p-4 rounded-lg border",
              theme() === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50",
            )}
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-medium text-sm">Deactivate Account</h3>
                <p class="text-sm text-gray-500 mt-1">Hide your account from others. Your data won't be deleted.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={deactivated()}
                  onChange={() => setDeactivated(!deactivated())}
                  class="sr-only peer"
                />
                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
          
        `}
      </style>
    </dialog>
  )
}
