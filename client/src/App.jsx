import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import About from "./pages/About.jsx";
import AdminResource from "./pages/admin/AdminResource.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Gallery from "./pages/Gallery.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/admin/Login.jsx";
import News from "./pages/News.jsx";
import NewsDetail from "./pages/NewsDetail.jsx";
import Partners from "./pages/Partners.jsx";
import ProgramDetail from "./pages/ProgramDetail.jsx";
import Programs from "./pages/Programs.jsx";
import Services from "./pages/Services.jsx";
import Team from "./pages/Team.jsx";
import VideoDetail from "./pages/VideoDetail.jsx";
import Videos from "./pages/Videos.jsx";

function RequireAuth({ children }) {
  return localStorage.getItem("ldi_token") ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:id" element={<ProgramDetail />} />
        <Route path="/video" element={<Videos />} />
        <Route path="/video/:slug" element={<VideoDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/team" element={<Team />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<AdminResource type="posts" />} />
        <Route path="events" element={<AdminResource type="events" />} />
        <Route path="videos" element={<AdminResource type="videos" />} />
        <Route path="team" element={<AdminResource type="team" />} />
        <Route path="gallery" element={<AdminResource type="gallery" />} />
        <Route path="partners" element={<AdminResource type="partners" />} />
        <Route path="messages" element={<AdminResource type="messages" />} />
      </Route>
    </Routes>
  );
}
