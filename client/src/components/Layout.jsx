import { Outlet } from "react-router-dom";
import BrandPageLoader from "./BrandPageLoader.jsx";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  return (
    <>
      <BrandPageLoader />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
