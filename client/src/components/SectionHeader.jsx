export default function SectionHeader({ eyebrow, title, text, light = false }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow && <p className={`mb-3 font-heading text-sm font-black uppercase ${light ? "text-ember" : "text-maroon"}`}>#{eyebrow}</p>}
      <h2 className={`font-heading text-4xl font-black leading-tight sm:text-5xl ${light ? "text-white" : "text-ink"}`}>{title}</h2>
      {text && <p className={`mt-4 text-[17px] leading-8 ${light ? "text-white/75" : "text-black/65"}`}>{text}</p>}
    </div>
  );
}
