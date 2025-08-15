import AreaChart from "@/components/AreaChart";
import DurationChart from "@/components/DurationChart";
import OverviewInfoCards from "@/components/OverviewInfoCards";
import Title from "@/components/Title";
import TodayActivity from "@/components/TodayActivity";

export default function Dashboard() {
  return (
    <section className="flex flex-col gap-6 md:gap-8">
      <Title title="Overview" />
      <OverviewInfoCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <TodayActivity />
        <DurationChart />
      </div>
      <AreaChart />
      <p className="text-xs md:text-sm text-muted-foreground mt-4">
        Note: All data is generated for demo purposes and will update on each
        render.
      </p>
    </section>
  );
}
