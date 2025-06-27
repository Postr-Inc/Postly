import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useTheme from "@/src/Utils/Hooks/useTheme";
import { joinClass } from "@/src/Utils/Joinclass";
export default function LoadingIndicator() {
  let { theme } = useTheme();
  return (
    <Card
      class={joinClass(
        theme() === "dark"
          ? "bg-black text-white border-[#1c1c1c] border-t-0"
          : "border-[#e0e0e0] border-t-0",
        "rounded-none shadow-none"
      )}
    >
      <CardHeader class="flex sm:p-3 p-[14px]  flex-row gap-5 space-y-0  relative ">
        <div class="skeleton w-10  p-[14px] h-10 rounded"></div>
        <CardTitle class="cursor-pointer">
        <div class="skeleton rounded-full h-4 w-20"></div></CardTitle>
        <CardTitle class=" ">  <div class="skeleton rounded-full h-4 w-20"></div></CardTitle>
      </CardHeader>
      <CardContent class="sm:p-3  p-[14px]"><div class="skeleton rounded h-10 w-full"></div></CardContent>  
    </Card>
  );
}
