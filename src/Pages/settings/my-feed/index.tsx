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
                    w-6 hero h-6 cursor-pointer font-bold text-white  ${
                      theme() === "light"
                        ? "text-black fill-black"
                        : "text-white fill-white"
                    }
                    `}
            onClick={() => navigate("/settings")}
          />
          <h1 class="text-2xl hero  ">My Feed</h1>
          <div></div>
        </div>
      </div>
    </Page>
  );
}
