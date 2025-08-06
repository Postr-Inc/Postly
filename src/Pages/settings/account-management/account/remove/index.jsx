import Page from "@/components/ui/Page";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import { api } from "@/src";

export default function () {
  const { params, route, navigate, goBack } = useNavigation("/settings");

  return (
    <Page {...{ params, route, navigate, goBack }}>
      <div class="flex items-center px-4 py-3">
        <button onClick={goBack} class="mr-4">
          <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div class="flex-1 text-center">
          <h1 class="text-xl font-bold">Account</h1>
          <p class="text-gray-500 text-sm">@{api.authStore.model.username}</p>
        </div>
        <div class="w-6"></div>
      </div>

      <div class="p-5">
        <h1 class="text-2xl font-bold mt-5">This will delete your account!</h1>
        <p class="mt-2 text-sm">
          You are about to start the process of permanently removing all your
          data. This is irreversible. If you would like a copy of your data, you
          can always{" "}
          <a
            class="text-blue-500 cursor-pointer"
            onClick={() =>
              navigate("/settings/account-management/account/request-data")
            }
          >
            request it
          </a>
          . Otherwise, any data created by you, including interactions,
          comments, and more, will be permanently deleted.
        </p>

        <h1 class="text-2xl font-bold mt-5">What else to know</h1>
        <p class="mt-2 text-sm underline">
          Some account information may be stored elsewhere. Postly has an
          automated backup policy: we store backups for up to 30 days to ensure
          that, in case anyone’s data is accidentally wiped or a severe outage
          occurs, we can restore it. You have the right to request your data
          from a backup even after you delete your account.
        </p>
        <p class="mt-2 text-sm">
          We cannot restore your account once it has been deleted. If you choose
          to return to the platform later, you will need to create a new account
          from scratch. You are free to re-post any content under a new profile
          if you wish. If you want to keep your content but prevent others from
          viewing your account, deactivating your profile is the better option.
        </p>
      </div>

      <button
        class="text-red-500 text-center"
        onClick={() => {
          document.getElementById("deleteModalConfirm").showModal();
        }}
      >
        Delete Account
      </button>
    </Page>
  );
}
