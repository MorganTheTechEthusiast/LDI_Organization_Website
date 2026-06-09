import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "../components/ContactForm.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function Contact() {
  return (
    <section className="section-pad bg-mist">
      <SectionHeader eyebrow="Contact" title="Work With Liberia Digital Insights" text="Invite LDI to cover an event, promote a tech program, support a training, feature your startup, or explore partnership opportunities." />
      <div className="container-tight grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg bg-ink p-8 text-white">
          <h2 className="text-2xl font-black">Contact Information</h2>
          <div className="mt-6 grid gap-5 text-white/75">
            <p className="flex gap-3"><Mail className="h-5 w-5 text-ember" /> info@liberiadigitalinsights.org</p>
            <p className="flex gap-3"><Phone className="h-5 w-5 text-ember" /> +231 770 000 000</p>
            <p className="flex gap-3"><MapPin className="h-5 w-5 text-ember" /> Monrovia, Liberia</p>
          </div>
          <div className="mt-8 grid h-64 place-items-center rounded-lg border border-white/15 bg-white/10 text-center text-sm font-semibold text-white/60">
            Google Map Placeholder<br />Monrovia, Liberia
          </div>
        </div>
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
