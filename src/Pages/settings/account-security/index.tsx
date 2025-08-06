import ArrowLeft from "@/components/Icons/ArrowLeft";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import Page from "@/components/ui/Page";
import { useParams } from "@solidjs/router";
export default function () {
  const { params, route, navigate, goBack } = useNavigation("/settings");
  const { theme, toggleTheme } = useTheme();
  return (
    <Page
      {...{ navigate, params, route: route }}
      id={crypto.randomUUID()}
      hide={["bottomNav"]}
    >
      <div class="flex flex-col w-full h-full p-5">
        <div class="flex flex-row  hero justify-between gap-2">
          <ArrowLeft
            class={`
                                                           w-6 hero h-6 cursor-pointer font-bold   `}
            onClick={() => goBack()}
          />
          <h1 class="text-2xl hero  ">Account Security</h1>
          <div></div>
        </div>
      </div>
      <div class="mt-12 flex  flex-col">
        <div class="flex flex-col p-5 gap-2">
          <label class="label">
            <span class="label-text">Postly One MFA</span>
          </label>
          <div class="form-control">
            <label class="label cursor-pointer gap-5">
              <span class="label-text">
                Postly one is our mfa client, that allows you to securely and
                quickly log into postly services, this minimizes any options for
                hackers and breachers to steal data
                <br />
                <span class="text-sm text-gray-500">Coming soon!</span>
              </span>
            </label>
            <button class="btn text-white bg-blue-500 rounded-xl mt-5">
              Setup new Client
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}
