import NonDashboardNavbar from "../components/NonDashboardNavbar"
import Landing from "../app/(nondashboard)/landing/page"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-customgreys-primarybg flex flex-col">
      <NonDashboardNavbar /> 
      <main className="pt-20 flex-grow">
        <Landing />
      </main>
    </div>
  );
}
