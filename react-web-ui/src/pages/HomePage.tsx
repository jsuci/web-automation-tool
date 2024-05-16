import { SiteProvider } from "../providers/SiteContext";
import DashboardLayout from "../components/DashboardLayout";
import Dashboard from "./Dashboard";

interface HomePageProps {}

const HomePage = ({}: HomePageProps) => {
  return (
    <SiteProvider>
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    </SiteProvider>
  );
};

export default HomePage;
