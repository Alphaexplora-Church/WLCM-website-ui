import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop'; //

// --- IMPORT YOUR PAGES ---
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Experience from './pages/Experience';
import Engage from './pages/Engage';
import Give from './pages/Give';
import Watch from './pages/Watch';
import PrayerWall from './features/Engage/PrayerWall';
import Contact from './features/Engage/Contact/index';
import FindFreedom from './features/Engage/FindFreedom';
import DiscoverPurpose from './features/Engage/DiscoverPurpose';
import Login from './pages/Login';
import AdminDashboard from './features/Admin/AdminDashboard';
import AdminEvents from './features/Admin/AdminEvents';
import AdminJourneys from './features/Admin/AdminJourneys';
import AdminRegistrations from './features/Admin/AdminRegistrations';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* Reset scroll on every route change */}
      <ScrollToTop />

      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/beliefs" element={<AboutUs />} />
        <Route path="/leaders" element={<AboutUs />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/engage" element={<Engage />} />
        <Route path="/sermons" element={<Engage />} />
        <Route path="/give" element={<Give />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/find-freedom" element={<FindFreedom />} />
        <Route path="/discover-purpose" element={<DiscoverPurpose />} />
        <Route path="/churches" element={<AboutUs />} />
        <Route path="/watch" element={<Watch />} />
        <Route path="/prayer" element={<PrayerWall />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/journeys" element={<AdminJourneys />} />
        <Route path="/admin/registrations" element={<AdminRegistrations />} />
      </Routes>
    </AnimatePresence>
  );
}