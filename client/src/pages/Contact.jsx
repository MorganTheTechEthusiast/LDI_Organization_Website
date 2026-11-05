import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "../components/ContactForm.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

export default function Contact() {
  return (
    <section className="section-pad bg-mist">
      <SectionHeader eyebrow="Contact" title="Work With Liberia Digital Insights" text="Invite LDI to cover an event, promote a tech program, support a training, feature your startup, or explore partnership opportunities." />
      <div className="container-tight grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="contact-info-panel">
          <div className="contact-info-heading">
            <p className="eyebrow">Start a conversation</p>
            <h2>Let&apos;s build what comes next.</h2>
            <p>Have an idea, opportunity, or story to share? The LDI team would love to hear from you.</p>
          </div>
          <div className="contact-details">
            <a href="mailto:liberiadigitalinsights@gmail.com"><Mail className="h-5 w-5" /><span><small>Email us</small>liberiadigitalinsights@gmail.com</span></a>
            <a href="tel:+231777850481"><Phone className="h-5 w-5" /><span><small>Call us</small>+231 777 850 481</span></a>
            <div><MapPin className="h-5 w-5" /><span><small>Visit us</small>Starz University, Sinkor Airfield<br />Monrovia, Liberia</span></div>
          </div>
          <div className="contact-map-wrap">
            <iframe
              title="LDI location at Starz University, Sinkor Airfield"
              src="https://www.google.com/maps?q=Starz+University%2C+Sinkor+Airfield%2C+Monrovia%2C+Liberia&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <span className="contact-map-label"><MapPin className="h-4 w-4" /> Starz University, Sinkor Airfield</span>
          </div>
        </div>
        <div className="contact-form-panel">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
