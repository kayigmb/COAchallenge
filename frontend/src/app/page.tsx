import SidebarComponent from "@/components/Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import Accounts from "@/components/accounts";
import Budgets from "@/components/Budgets";
import Categories from "@/components/Categories";
import { Transactions } from "@/components/Transactions";
import SubCategories from "@/components/SubCategories";

export default function Home() {
  return (
    <>
      <SidebarComponent>
        <SidebarTrigger />
        <div className={"p-3 w-full"}>
          {/*Header*/}
          <Header />
          <div className={"p-2 gap-5 space-y-3 w-full grid grid-cols-1"}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-2">
              <Accounts />
              <Budgets />
              <Categories />
            </div>
            <div className={"w-full grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-6 md:grid-cols-1 gap-3"}>
              <div className={"col-span-4"}>
                <Transactions />
              </div>
              <div className={"col-span-2 w-full"}>
                <SubCategories />
              </div>
            </div>
          </div>
        </div>
      </SidebarComponent>
    </>
  );
}
