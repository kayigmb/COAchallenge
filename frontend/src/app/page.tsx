import SidebarComponent from "@/components/Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import Accounts from "@/components/accounts";

export default function Home() {
  return (
    <>
      <SidebarComponent>
        <SidebarTrigger />
        <div className={"p-3 w-full"}>
            {/*Header*/}
            <Header />
            <div className={"p-2 flex space-x-3 space-y-3 w-full"}>
                <Accounts />
                {/*<div>*/}
                {/*    fasdfadf*/}
                {/*</div>*/}
            </div>
        </div>
      </SidebarComponent>
    </>
  );
}
