import { Link } from "react-router-dom";

const sizes = {
  nav: "h-14 w-auto",
  footer: "h-16 w-auto",
  admin: "h-12 w-auto",
  login: "h-28 w-auto",
};

export default function Logo({ to, size = "nav", className = "" }) {
  const image = (
    <img
      src="/ldi-logo.svg"
      alt="Liberia Digital Insights"
      className={`${sizes[size] || sizes.nav} ${className}`}
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
