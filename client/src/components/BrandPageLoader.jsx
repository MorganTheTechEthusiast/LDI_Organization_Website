import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";

const INITIAL_DURATION = 900;
const ROUTE_DURATION = 520;

export default function BrandPageLoader() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const [visible, setVisible] = useState(true);
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    const routeChanged = previousPath.current !== pathname;
    previousPath.current = pathname;
    setIsInitial(!routeChanged);
    setVisible(true);

    const timer = window.setTimeout(() => setVisible(false), routeChanged ? ROUTE_DURATION : INITIAL_DURATION);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className={`brand-loader ${isInitial ? "brand-loader-initial" : "brand-loader-route"}`} role="status" aria-live="polite" aria-label="Loading Liberia Digital Insights">
      <div className="brand-loader-mark">
        <span className="brand-loader-ring" aria-hidden="true" />
        <Logo size="login" />
      </div>
      <p className="brand-loader-tagline">Inform. Inspire. Innovate.</p>
      <span className="brand-loader-line" aria-hidden="true" />
    </div>
  );
}
