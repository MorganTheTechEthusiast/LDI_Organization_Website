export default function CardImage({ src, alt, className = "h-56" }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full object-cover ${className}`}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = "https://dummyimage.com/900x600/111113/ffffff&text=Liberia+Digital+Insights";
      }}
    />
  );
}
