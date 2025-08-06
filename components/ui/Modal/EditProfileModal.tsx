"use client"

import { api } from "@/src"
import useTheme from "@/src/Utils/Hooks/useTheme"
import { joinClass } from "@/src/Utils/Joinclass"
import { createSignal, createEffect, Switch, Match, Show, For } from "solid-js"

// Icon Components
 

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 0 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
  </svg>
)

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.2c1.99 0 3.6-1.61 3.6-3.6s-1.61-3.6-3.6-3.6-3.6 1.61-3.6 3.6 1.61 3.6 3.6 3.6zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
  </svg>
)

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
)

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.9C4.29 7 2.2 9.09 2.2 11.7s2.09 4.7 4.7 4.7H11v-1.9H6.9c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm5-6h4.1c2.61 0 4.7 2.09 4.7 4.7s-2.09 4.7-4.7 4.7H13v1.9h4.1c2.61 0 4.7-2.09 4.7-4.7S19.71 7 17.1 7H13v2z" />
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
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
  const socialPlatforms = [
    { name: "Twitter", url: "https://twitter.com/", icon: "🐦" },
    { name: "LinkedIn", url: "https://linkedin.com/", icon: "💼" },
    { name: "GitHub", url: "https://github.com/", icon: "🐙" },
    { name: "Instagram", url: "https://instagram.com/", icon: "📷" },
    { name: "Facebook", url: "https://facebook.com/", icon: "📘" },
    { name: "TikTok", url: "https://tiktok.com/", icon: "🎵" },
    { name: "YouTube", url: "https://youtube.com/", icon: "📺" },
    { name: "Reddit", url: "https://reddit.com/", icon: "🤖" },
    { name: "Discord", url: "https://discord.com/", icon: "🎮" },
  ]
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
    <dialog id="editProfileModal" class="modal">
      <div
        class={joinClass(
          "modal-box max-w-2xl mx-auto rounded-2xl shadow-2xl border-0 p-0 max-h-[90vh] overflow-hidden",
          theme() === "dark"
            ? "bg-gray-900 text-white border border-gray-800"
            : "bg-white text-gray-900 border border-gray-100",
        )}
      >
        {/* Header */}
        <div
          class={joinClass(
            "sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b",
            theme() === "dark"
              ? "border-gray-800 bg-gray-900/95 backdrop-blur-sm"
              : "border-gray-200 bg-white/95 backdrop-blur-sm",
          )}
        >
          <div class="flex items-center space-x-4">
            <button
              onClick={closeModal}
              class={joinClass(
                "p-2 rounded-full transition-colors",
                theme() === "dark"
                  ? "hover:bg-gray-800 text-gray-300 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
              )}
            >
              <CloseIcon />
            </button>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Edit profile</h2>
          </div>
          <button
            onClick={save}
            disabled={isSaving() || hasErrors() || !hasChanges()}
            class={joinClass(
              "px-6 py-2 rounded-full font-semibold transition-all duration-200",
              isSaving() || hasErrors() || !hasChanges()
                ? theme() === "dark"
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                : theme() === "dark"
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25",
            )}
          >
            {isSaving() ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Scrollable Content */}
        <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Profile Images Section */}
          <div class="relative">
            {/* Banner */}
            <div class="relative h-48 overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500">
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
                      api.cdn.getUrl("users", api.authStore.model.id, api.authStore.model.banner) ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt="Current banner"
                    class="w-full h-full object-cover"
                  />
                </Match>
              </Switch>

              {/* Banner upload overlay */}
              <label
                for="banner-upload"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
              >
                <div class="bg-black bg-opacity-75 rounded-full p-4 group-hover:scale-110 transition-transform">
                  <CameraIcon />
                </div>
              </label>
            </div>

            {/* Avatar */}
            <div class="absolute -bottom-16 left-6">
              <div class="relative">
                <div class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
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
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt="Current avatar"
                        class="w-full h-full object-cover"
                      />
                    </Match>
                    <Match when={true}>
                      <div class="w-full h-full flex items-center justify-center text-3xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {api.authStore.model.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    </Match>
                  </Switch>
                </div>

                {/* Avatar upload overlay */}
                <label
                  for="avatar-upload"
                  class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer group"
                >
                  <div class="bg-black bg-opacity-75 rounded-full p-3 group-hover:scale-110 transition-transform">
                    <CameraIcon />
                  </div>
                </label>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input type="file" id="avatar-upload" class="hidden" accept="image/*" onChange={handleAvatarChange} />
            <input type="file" id="banner-upload" class="hidden" accept="image/*" onChange={handleBannerChange} />
          </div>

          {/* Form Fields */}
          <div class="px-6 pt-20 pb-6 space-y-6">
            {/* Username */}
            <div class={joinClass("space-y-2", theme() === "dark"  && "text-white")}>
              <label class="block text-sm font-semibold ">Name</label>
              <div class="relative">
                <input
                  type="text"
                  value={username()}
                  onInput={(e) => setUsername(e.currentTarget.value)}
                  onBlur={() => handleFieldBlur("username")}
                  class={joinClass(
                    "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200",
                    theme() === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
                    errors().username && touched().username
                      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                      : theme() === "dark"
                        ? "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white placeholder-gray-400"
                        : "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 placeholder-gray-500",
                    "focus:outline-none",
                  )}
                  placeholder="Your name"
                  maxLength={50}
                />
                <div class="absolute right-3 top-3 text-sm text-gray-400">{username().length}/50</div>
              </div>
              <Show when={errors().username && touched().username}>
                <div class="flex items-center gap-2 text-red-500 text-sm">
                  <AlertIcon />
                  {errors().username}
                </div>
              </Show>
            </div>

            {/* Handle */}
            <div class={joinClass("space-y-2", theme() === "dark"  && "text-white")}>
              <label class="block text-sm font-semibold  ">Handle</label>
              <div class="relative">
                <div class="absolute left-4 top-3 text-gray-500 dark:text-gray-400">@</div>
                <input
                  type="text"
                  value={handle()}
                  onInput={(e) => setHandle(e.currentTarget.value)}
                  onBlur={() => handleFieldBlur("handle")}
                  class={joinClass(
                    "w-full pl-8 pr-16 py-3 rounded-xl border-2 transition-all duration-200",
                    theme() === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
                    errors().handle && touched().handle
                      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                      : theme() === "dark"
                        ? "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white placeholder-gray-400"
                        : "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 placeholder-gray-500",
                    "focus:outline-none",
                  )}
                  placeholder="username"
                  maxLength={30}
                />
                <div class="absolute right-3 top-3 text-sm text-gray-400">{handle().length}/30</div>
              </div>
              <Show when={errors().handle && touched().handle}>
                <div class="flex items-center gap-2 text-red-500 text-sm">
                  <AlertIcon />
                  {errors().handle}
                </div>
              </Show>
            </div>

            {/* Bio */}
            <div class={joinClass("space-y-2", theme() === "dark"  && "text-white")}>
              <label class="block text-sm font-semibold ">Bio</label>
              <div class="relative">
                <textarea
                  value={bio()}
                  onInput={(e) => setBio(e.currentTarget.value)}
                  onBlur={() => handleFieldBlur("bio")}
                  class={joinClass(
                    "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none h-24",
                    theme() === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
                    errors().bio && touched().bio
                      ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                      : theme() === "dark"
                        ? "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white placeholder-gray-400"
                        : "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 placeholder-gray-500",
                    "focus:outline-none",
                  )}
                  placeholder="Tell the world about yourself"
                  maxLength={160}
                />
                <div class="absolute right-3 bottom-3 text-sm text-gray-400">{bio().length}/160</div>
              </div>
              <Show when={errors().bio && touched().bio}>
                <div class="flex items-center gap-2 text-red-500 text-sm">
                  <AlertIcon />
                  {errors().bio}
                </div>
              </Show>
            </div>

            {/* Location */}
            <div class={joinClass("space-y-2", theme() === "dark"  && "text-white")}>
              <label class="block text-sm font-semibold ">Location</label>
              <input
                type="text"
                value={location()}
                onInput={(e) => setLocation(e.currentTarget.value)}
                onBlur={() => handleFieldBlur("location")}
                class={joinClass(
                  "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200",
                  theme() === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
                  errors().location && touched().location
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                    : theme() === "dark"
                      ? "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-white placeholder-gray-400"
                      : "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-gray-900 placeholder-gray-500",
                  "focus:outline-none",
                )}
                placeholder="Where are you located?"
                maxLength={100}
              />
              <Show when={errors().location && touched().location}>
                <div class="flex items-center gap-2 text-red-500 text-sm">
                  <AlertIcon />
                  {errors().location}
                </div>
              </Show>
            </div>

            {/* Social Links */}
            <div class="space-y-4">
              <div class={joinClass("flex items-center justify-between", theme() == "dark" && "text-white")}>
                <label class="block text-sm font-semibold ">Social Links</label>
                <div class="relative">
                  <select
                  class={joinClass("flex items-center cursor-pointer justify-between", theme() == "dark" && "text-white", "appearance-none   rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all duration-200")}
                     
                    value=""
                    onChange={(e) => {
                      const selected = e.currentTarget.value
                      if (selected && !social().some((link) => link.startsWith(selected))) {
                        setSocial([...social(), selected])
                      }
                      e.currentTarget.value = ""
                    }}
                  >
                    <option value="" disabled>
                      Add platform
                    </option>
                    <For each={socialPlatforms}>
                      {(platform) => (
                        <option value={platform.url} disabled={social().some((link) => link.startsWith(platform.url))}>
                          {platform.icon} {platform.name}
                        </option>
                      )}
                    </For>
                  </select>
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <PlusIcon />
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <For each={social()}>
                  {(link, index) => (
                    <div
                      class={joinClass(
                        "flex items-center gap-3 p-3 rounded-xl",
                        theme() === "dark"
                          ? "bg-gray-800/50 border text-white border-gray-700"
                          : "bg-gray-50 border border-gray-200",
                      )}
                    >
                      <div class="flex items-center gap-2 flex-1">
                        <LinkIcon />
                        <input
                          type="url"
                          class="flex-1 bg-transparent border-0 outline-none "
                          value={link}
                          onChange={(e) => {
                            const updated = [...social()]
                            updated[index()] = e.currentTarget.value
                            setSocial(updated)
                          }}
                          placeholder="https://..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = social().filter((_, i) => i !== index())
                          setSocial(updated)
                        }}
                        class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </div>

            {/* Account Settings */}
            <div class={joinClass("pt-6 border-t", theme() === "dark" ? "border-gray-800" : "border-gray-200")}>
              <div
                class={joinClass(
                  "rounded-xl p-4",
                  theme() === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-blue-50/50 border border-blue-100",
                )}
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold ">Account Privacy</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Temporarily hide your profile from other users. Your data will be preserved.
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={deactivated()}
                      onChange={() => setDeactivated(!deactivated())}
                      class="sr-only peer"
                    />
                    <div
                      class={joinClass(
                        "relative w-12 h-6 rounded-full peer transition-colors",
                        theme() === "dark"
                          ? "bg-gray-700 peer-checked:bg-blue-600 peer-focus:ring-blue-800"
                          : "bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-blue-300",
                        "peer-focus:outline-none peer-focus:ring-4 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
                      )}
                    ></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}
