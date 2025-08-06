import useScrollingDirection from "@/src/Utils/Hooks/useScrollingDirection";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";

export default function Dropdown({ children, direction , point}: { children: any, direction: string , point: string}) {
  const { theme } = useTheme(); 
  return (
    <div class={joinClass("dropdown z-[99999] ",  direction === "left" ? "dropdown-left" :  direction === "top" ? "dropdown-top" : "dropdown-bottom", point === "start" ? "dropdown-start" : "dropdown-end")}>
      <div tabindex="0" role="button">
        {children[0]}
      </div>
      <li
        tabindex="0"
        class={joinClass("dropdown-content justify-center flex flex-col menu bg-base-100 rounded-[.4rem] z-[99999] w-64  h-fit p-2 shadow-lg", theme() === "dark" ? "border-[#1c1c1c] border" : "border-[#d7d6d6] border")}
      >
        {children.slice(1)}
      </li>
    </div>
  );
}


function DropdownItem({ children, onClick }: { children: any, onClick: ()=> void}) {
  return <span onClick={onClick} class="p-2 flex hero gap-2 cursor-pointer">{children}</span>;
}

Dropdown.Item = DropdownItem;

function DropdownDivider() {
  return <li class="divider"></li>;
}

Dropdown.Divider = DropdownDivider;

function DropdownHeader({ children }: { children: any }) {
  return <span class="dropdown-header">{children}</span>;
}

Dropdown.Header = DropdownHeader;

export {
    Dropdown,
    DropdownItem,
    DropdownDivider,
    DropdownHeader,
}