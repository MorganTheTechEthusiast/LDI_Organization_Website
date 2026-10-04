import { Link } from "react-router-dom";

const sizes = {
  nav: "h-10 w-auto",
  footer: "h-12 w-auto",
  admin: "h-10 w-auto",
  login: "h-20 w-auto",
};

export default function Logo({ to, size = "nav", className = "" }) {
  const image = (
    <img
      src="/ldi-official-logo.png"
      alt="Liberia Digital Insights"
      className={`logo-image ${sizes[size] || sizes.nav} ${className}`}
    />
  );

  if (!to) return image;

  return (
    <Link
      to={to}
      aria-label="Liberia Digital Insights home"
      className="inline-flex items-center"
    >
      {image}
    </Link>
  );
}
