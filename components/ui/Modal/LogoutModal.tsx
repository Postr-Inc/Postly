// @ts-nocheck
import { api } from "@/src";
import logo from "@/src/assets/icon_transparent.png";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
export default function LogoutModal(props: any) {
  let { theme } = useTheme();
  return (
    <>
      <dialog
        style={{
          border: theme() == "dark" ? "1px solid #2d2d2d" : "1px solid #f9f9f9",
          borderRadius: "10px",
        }}
        id="logout-modal"
        className={` rounded-xl   modal-middle

            `}
      >
        <div
          style={{
            borderRadius: "10px",
            border:
              theme() == "dark" ? "1px solid #2d2d2d" : "1px solid #f9f9f9",
          }}
          className={`flex p-2 xl:w-[23vw] h-[45vh] xl:h-[45vh] rounded-xl items-center
             ${
               theme() === "dark"
                 ? "bg-base-300 text-white"
                 : "bg-white text-black "
             }
            justify-center flex-col mx-auto`}
        >
          <img
            src={logo}
            className="rounded"
            alt="postr logo"
            width={60}
            class={joinClass(theme() == "dark" ? "" : "black")}
            height={60}
          ></img>
          <p className="font-bold text-xl mt-2">Loging out of Postr?</p>
          <p className="text-sm mt-2">
            You can always log back in at any time.
          </p>
          <button
            className={`btn btn-ghost rounded-full w-full text-white  bg-red-500 mt-5`}
            onClick={() => {
              api.authStore.logout(true);
            }}
          >
            Logout
          </button>
          <form method="dialog" className="w-full">
            <button className="btn btn-ghost    mt-5 w-full rounded-full bg-base-300 ">
              Cancel
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
