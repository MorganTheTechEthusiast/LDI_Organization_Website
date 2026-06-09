import { Send } from "lucide-react";
import { useState } from "react";
import { api } from "../api.js";

const empty = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("");

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus("Please complete all required fields.");
      return;
    }
    await api.post("/contact", form);
    setForm(empty);
    setStatus("Message sent. The LDI team will respond soon.");
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="field" name="name" placeholder="Full name" value={form.name} onChange={update} />
        <input className="field" name="email" type="email" placeholder="Email address" value={form.email} onChange={update} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="field" name="phone" placeholder="Phone number" value={form.phone} onChange={update} />
        <input className="field" name="subject" placeholder="Subject" value={form.subject} onChange={update} />
      </div>
      <textarea className="field min-h-36" name="message" placeholder="How can we help?" value={form.message} onChange={update} />
      {status && <p className="text-sm font-semibold text-maroon">{status}</p>}
      <button className="btn-dark w-fit" type="submit"><Send className="h-4 w-4" /> Send Message</button>
    </form>
  );
}
