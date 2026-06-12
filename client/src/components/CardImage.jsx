export default function CardImage({ src, alt, className = "", imageClassName = "", ratio = "aspect-[16/10]" }) {
  return (
    <div className={`relative w-full overflow-hidden bg-mist dark:bg-[#17171a] ${ratio} ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover object-center ${imageClassName}`}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.src = "https://dummyimage.com/900x600/111113/ffffff&text=Liberia+Digital+Insights";
        }}
      />
    </div>
  );
}
