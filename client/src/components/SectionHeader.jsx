export default function SectionHeader({ eyebrow, title, text, light = false }) {
  return (
    <div className={`section-heading mx-auto mb-10 max-w-3xl ${light ? "section-heading-light" : ""}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-heading text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-[17px] leading-8">{text}</p>}
    </div>
  );
}
