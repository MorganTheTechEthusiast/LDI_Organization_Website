import { ArrowRight, CheckCircle2, ChevronDown, ClipboardCheck, GraduationCap, ShieldCheck, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";

const fallbackProgram = {
  title: "Girls in Tech Digital Skills Training Program",
  cohort_number: "Cohort #2",
  tagline: "Empowering Young Women Through Digital Skills, Technology, and Opportunity.",
  overview: "A practical, supportive learning experience helping young Liberian women build confidence with technology and prepare for meaningful digital opportunities.",
  about_ldi: "Liberia Digital Insights connects people to trusted technology information, practical learning, and opportunity.",
  learn_items: ["Digital literacy and online safety", "Productivity tools and professional communication", "Introduction to web, design, and digital creation", "Career readiness, entrepreneurship, and opportunity discovery"],
  duration: "6 months",
  schedule: "Schedule will be shared with accepted applicants.",
  eligibility: "Young women in Liberia who are motivated to learn, can commit to the training schedule, and have access to a smartphone.",
  fee: 0,
  currency: "USD",
  payment_instructions: "Do not send money until an authorized LDI administrator confirms the official payment instructions.",
  faq_items: []
};

const initialForm = {
  full_name: "", date_of_birth: "", gender: "", phone: "", whatsapp: "", email: "", residential_address: "", county: "", city_community: "",
  educational_status: "", institution: "", highest_qualification: "", occupation: "", computer_experience: "", previous_training: "", current_skills: "", has_computer: "", has_smartphone: "", interest_reason: "", expected_outcome: "",
  motivation_statement: "", relevant_experience: "", learned_from: "", emergency_name: "", emergency_phone: "", photo_url: "", supporting_document_url: "", declaration_accepted: false, terms_accepted: false, privacy_consent: false
};

const steps = ["Personal", "Education", "Digital Skills", "Additional", "Review"];
const input = (label, name, form, setForm, type = "text", required = false) => <label className="grid gap-2"><span className="label">{label}{required && <span className="text-maroon"> *</span>}</span><input className="field" type={type} value={form[name] || ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required={required} /></label>;
const select = (label, name, options, form, setForm) => <label className="grid gap-2"><span className="label">{label}</span><select className="field" value={form[name] || ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })}><option value="">Select one</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
const area = (label, name, form, setForm, required = false) => <label className="grid gap-2 sm:col-span-2"><span className="label">{label}{required && <span className="text-maroon"> *</span>}</span><textarea className="field min-h-28" value={form[name] || ""} onChange={(event) => setForm({ ...form, [name]: event.target.value })} required={required} /></label>;

export default function GirlsInTech() {
  const { data } = useFetch("/training-programs/girls-in-tech-cohort-2", fallbackProgram);
  const program = data?.title ? data : fallbackProgram;
  const [showApplication, setShowApplication] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [statusForm, setStatusForm] = useState({ application_reference: "", email: "" });
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [paymentForm, setPaymentForm] = useState({ payment_method: "Orange Money", amount: program.fee || "", payment_reference: "", transaction_id: "", evidence_url: "", proof: null });

  const learnItems = useMemo(() => Array.isArray(program.learn_items) ? program.learn_items : [], [program.learn_items]);
  const updatePayment = (event) => setPaymentForm({ ...paymentForm, [event.target.name]: event.target.value });

  function nextStep(event) {
    event.preventDefault();
    setError("");
    if (step < steps.length - 1) setStep(step + 1);
  }

  async function submitApplication(event) {
    event.preventDefault();
    setError("");
    try {
      const { data: response } = await api.post("/training-applications", form);
      setResult(response);
      setShowConfirmation(true);
      setShowApplication(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We could not submit your application. Please try again.");
    }
  }

  async function lookupStatus(event) {
    event.preventDefault();
    setStatusError("");
    try {
      const { data: response } = await api.post("/training-applications/status", statusForm);
      setStatus(response);
    } catch (requestError) { setStatus(null); setStatusError(requestError.response?.data?.message || "We could not find that application."); }
  }

  async function submitPayment(event) {
    event.preventDefault();
    setStatusError("");
    try {
      let evidenceUrl = paymentForm.evidence_url;
      if (paymentForm.proof) {
        const upload = new FormData();
        upload.append("proof", paymentForm.proof);
        const { data } = await api.post("/uploads/payment-proof", upload, { headers: { "Content-Type": "multipart/form-data" } });
        evidenceUrl = data.url;
      }
      await api.post("/training-payments", { ...paymentForm, proof: undefined, evidence_url: evidenceUrl, application_reference: status.application_reference, email: status.email });
      setStatus({ ...status, status: "Payment Submitted", payment_status: "Payment Submitted", payment: { status: "Payment Submitted" } });
    } catch (requestError) { setStatusError(requestError.response?.data?.message || "Payment submission failed."); }
  }

  return (
    <>
      <section className="brand-dark-surface training-program-hero text-white">
        <div className="container-tight grid gap-10 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-28">
          <div className="training-hero-copy"><p className="training-hero-kicker">{program.cohort_number} · Applications open</p><h1 className="mt-4 max-w-4xl text-5xl font-black leading-[.98] sm:text-7xl">{program.title}</h1><p className="mt-7 max-w-2xl text-xl leading-9 text-white/75">{program.tagline}</p><div className="training-hero-actions"><button type="button" onClick={() => { setShowApplication(true); setResult(null); }} className="btn-primary">Apply for Cohort #2 <ArrowRight className="h-4 w-4" /></button><a href="#status" className="training-hero-link">Track an application</a></div></div>
          <div className="training-hero-panel"><div className="training-hero-panel-image" /><div className="training-hero-panel-copy"><GraduationCap className="mb-5 h-10 w-10 text-ember" /><p className="text-sm font-black uppercase tracking-[.15em] text-ember">A practical pathway</p><h2 className="mt-3 text-3xl font-black">Learn. Build. Lead.</h2><p className="mt-3 leading-7 text-white/70">{program.overview}</p><div className="mt-6 grid gap-3 text-sm text-white/75"><span className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-ember" /> Built for young women in Liberia</span><span className="flex gap-3"><ClipboardCheck className="h-5 w-5 shrink-0 text-ember" /> Applications reviewed by LDI</span></div></div></div>
        </div>
      </section>

      {result && showConfirmation && <ApplicationConfirmation applicant={form.full_name} email={form.email} reference={result.application_reference} close={() => setShowConfirmation(false)} track={() => { setStatusForm({ application_reference: result.application_reference, email: form.email }); setShowConfirmation(false); document.getElementById("status")?.scrollIntoView({ behavior: "smooth" }); }} />}

      <section className="section-pad bg-paper"><SectionHeader eyebrow="About the program" title="Skills that open the next door." text={program.about_ldi} /><div className="container-tight grid gap-6 md:grid-cols-2"><article className="card p-7"><p className="eyebrow">What you will learn</p><div className="mt-5 grid gap-4">{learnItems.map((item) => <p className="flex gap-3 text-[15px] leading-7 text-black/70" key={item}><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-ember" />{item}</p>)}</div></article><article className="card p-7"><p className="eyebrow">Program details</p><div className="mt-5 grid gap-4 text-[15px] leading-7 text-black/70"><p><strong className="text-ink">Duration:</strong> {program.duration}</p><p><strong className="text-ink">Schedule:</strong> {program.schedule}</p><p><strong className="text-ink">Eligibility:</strong> {program.eligibility}</p><p><strong className="text-ink">Fee:</strong> {Number(program.fee) ? `${program.currency} ${program.fee}` : "See official payment instructions"}</p></div></article></div></section>

      <section className="section-pad bg-sand"><div className="container-tight grid gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><p className="eyebrow">Application process</p><h2 className="mt-2 text-4xl font-black text-maroon">A clear path from interest to opportunity.</h2><div className="mt-7 grid gap-4">{["Complete the online application", "LDI reviews applications", "Selected applicants receive next steps", "Payment is verified before registration"].map((item, index) => <div className="flex gap-4" key={item}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-maroon font-heading text-sm font-black text-white">0{index + 1}</span><p className="pt-1 font-semibold text-black/70">{item}</p></div>)}</div></div><div className="rounded-sm bg-white p-7 shadow-sm"><WalletCards className="h-9 w-9 text-ember" /><h2 className="mt-4 text-2xl font-black text-ink">Payment guidance</h2><p className="mt-3 leading-7 text-black/65">{program.payment_instructions}</p></div></div></section>

      <section id="status" className="section-pad bg-paper"><div className="container-tight grid gap-10 lg:grid-cols-[.9fr_1.1fr]"><div><p className="eyebrow">Applicant portal</p><h2 className="mt-2 text-4xl font-black text-maroon">Track your application.</h2><p className="mt-4 leading-7 text-black/65">Enter the reference number from your confirmation and the same email address used to apply.</p><form onSubmit={lookupStatus} className="mt-6 grid gap-4"><input className="field" placeholder="LDI-GIT-C2-2026-0001" value={statusForm.application_reference} onChange={(event) => setStatusForm({ ...statusForm, application_reference: event.target.value })} required /><input className="field" type="email" placeholder="Email address" value={statusForm.email} onChange={(event) => setStatusForm({ ...statusForm, email: event.target.value })} required /><button className="btn-crimson w-fit" type="submit">Check status <ArrowRight className="h-4 w-4" /></button></form>{statusError && <p className="mt-4 text-sm font-semibold text-maroon">{statusError}</p>}</div>{status && <div className="card p-7"><p className="eyebrow">{status.cohort_number}</p><h3 className="mt-2 text-2xl font-black text-ink">{status.full_name}</h3><div className="mt-5 grid gap-3 text-sm text-black/65"><p>Application: <strong className="text-maroon">{status.status}</strong></p><p>Payment: <strong className="text-maroon">{status.payment?.status || status.payment_status}</strong></p></div>{status.payment?.receipt_number && <a className="btn-crimson mt-5" href={`${api.defaults.baseURL}/training-receipts/${status.payment.receipt_number}.pdf?email=${encodeURIComponent(status.email)}`}>Download verified receipt</a>}{status.payment?.status !== "Payment Verified" && <form onSubmit={submitPayment} className="mt-7 border-t border-black/10 pt-6"><p className="font-heading font-black text-ink">Submit payment for manual review</p><p className="mt-2 text-sm text-black/60">Enter your transaction ID or upload a payment screenshot. LDI will verify it manually.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><select className="field" name="payment_method" value={paymentForm.payment_method} onChange={updatePayment}><option>Orange Money</option><option>Lonestar MTN Mobile Money</option><option>Bank transfer</option><option>Other</option></select><input className="field" name="amount" type="number" min="1" step="0.01" placeholder="Amount" value={paymentForm.amount} onChange={updatePayment} required /><input className="field" name="payment_reference" placeholder="Payment reference (optional)" value={paymentForm.payment_reference} onChange={updatePayment} /><input className="field" name="transaction_id" placeholder="Transaction ID (optional)" value={paymentForm.transaction_id} onChange={updatePayment} /><label className="field flex cursor-pointer items-center gap-3 sm:col-span-2"><span className="flex-1 text-sm text-black/60">Payment screenshot (optional)</span><input type="file" accept="image/*" onChange={(event) => setPaymentForm({ ...paymentForm, proof: event.target.files?.[0] || null })} /></label></div><button className="btn-primary mt-5" type="submit">Submit payment for verification</button></form>}</div>}</div></section>

      <section className="section-pad bg-sand"><SectionHeader eyebrow="Questions" title="Frequently asked questions" /> <div className="container-tight max-w-3xl grid gap-3">{(program.faq_items || []).map((faq) => <details className="card p-5" key={faq.question}><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading font-black text-ink">{faq.question}<ChevronDown className="h-5 w-5 shrink-0 text-ember" /></summary><p className="mt-3 leading-7 text-black/65">{faq.answer}</p></details>)}</div></section>

      {showApplication && <ApplicationModal form={form} setForm={setForm} step={step} setStep={setStep} error={error} submitApplication={submitApplication} close={() => { setShowApplication(false); setStep(0); }} />}
    </>
  );
}

function ApplicationModal({ form, setForm, step, setStep, error, submitApplication, close }) {
  function nextStep(event) {
    event.preventDefault();
    if (step < 4) setStep(step + 1);
  }

  const content = [
    <div className="grid gap-4 sm:grid-cols-2">{input("Full name", "full_name", form, setForm, "text", true)}{input("Date of birth", "date_of_birth", form, setForm, "date")}{select("Gender", "gender", ["Female", "Prefer not to say"], form, setForm)}{input("Phone number", "phone", form, setForm, "tel", true)}{input("WhatsApp number", "whatsapp", form, setForm, "tel")}{input("Email address", "email", form, setForm, "email", true)}{input("Residential address", "residential_address", form, setForm)}{select("County", "county", ["Montserrado", "Bong", "Margibi", "Nimba", "Grand Bassa", "Other"], form, setForm)}{input("City / community", "city_community", form, setForm)}</div>,
    <div className="grid gap-4 sm:grid-cols-2">{select("Current educational status", "educational_status", ["Secondary student", "University student", "Graduate", "Not currently studying"], form, setForm)}{input("School or institution", "institution", form, setForm)}{input("Highest qualification", "highest_qualification", form, setForm)}{input("Current occupation", "occupation", form, setForm)}{select("Previous computer experience", "computer_experience", ["None", "Basic", "Intermediate", "Advanced"], form, setForm)}{input("Previous digital training", "previous_training", form, setForm)}{area("Digital skills you currently possess", "current_skills", form, setForm)}</div>,
    <div className="grid gap-4 sm:grid-cols-2">{select("Access to laptop or desktop?", "has_computer", ["Yes", "No", "Shared access"], form, setForm)}{select("Access to smartphone?", "has_smartphone", ["Yes", "No"], form, setForm)}{area("Why are you interested in joining?", "interest_reason", form, setForm, true)}{area("What do you hope to achieve after training?", "expected_outcome", form, setForm, true)}</div>,
    <div className="grid gap-4 sm:grid-cols-2">{area("Motivation statement", "motivation_statement", form, setForm, true)}{area("Relevant experience", "relevant_experience", form, setForm)}{select("How did you learn about LDI?", "learned_from", ["Facebook", "LinkedIn", "Friend or family", "School or community", "Other"], form, setForm)}{input("Emergency contact name", "emergency_name", form, setForm, "text", true)}{input("Emergency contact phone", "emergency_phone", form, setForm, "tel", true)}{input("Passport photo URL (optional)", "photo_url", form, setForm, "url")}{input("Supporting document URL (optional)", "supporting_document_url", form, setForm, "url")}</div>,
    <div className="grid gap-4"><div className="rounded-sm bg-mist p-5 text-sm leading-7 text-black/70"><strong className="text-ink">Review your application</strong><p className="mt-2">Please confirm that your information is accurate before submission. LDI will use it only to review and manage this program application.</p><p className="mt-3"><strong>Name:</strong> {form.full_name || "Not provided"}<br /><strong>Email:</strong> {form.email || "Not provided"}<br /><strong>Phone:</strong> {form.phone || "Not provided"}</p></div><label className="flex gap-3 text-sm font-semibold text-black/70"><input type="checkbox" checked={form.declaration_accepted} onChange={(event) => setForm({ ...form, declaration_accepted: event.target.checked })} required /> I declare that the information provided is accurate.</label><label className="flex gap-3 text-sm font-semibold text-black/70"><input type="checkbox" checked={form.terms_accepted} onChange={(event) => setForm({ ...form, terms_accepted: event.target.checked })} required /> I agree to the program terms and conditions.</label><label className="flex gap-3 text-sm font-semibold text-black/70"><input type="checkbox" checked={form.privacy_consent} onChange={(event) => setForm({ ...form, privacy_consent: event.target.checked })} required /> I consent to LDI storing and reviewing this application.</label></div>
  ][step];

  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-3 sm:p-4"><form onSubmit={step === 4 ? submitApplication : nextStep} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-5 shadow-soft sm:p-7"><div className="flex items-start justify-between gap-5"><div><p className="eyebrow">Girls in Tech • Cohort #2</p><h2 className="mt-2 text-2xl font-black text-ink">Application form</h2></div><button type="button" className="grid h-9 w-9 place-items-center rounded-md bg-black/5 text-ink" onClick={close} aria-label="Close application">×</button></div><div className="mt-5 grid grid-cols-5 gap-2">{steps.map((label, index) => <button type="button" key={label} onClick={() => index <= step && setStep(index)} className={`border-t-4 pt-2 text-left text-xs font-black ${index <= step ? "border-maroon text-maroon" : "border-black/10 text-black/35"}`}>{index + 1}. {label}</button>)}</div><div className="mt-5">{content}</div>{error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-maroon">{error}</p>}<div className="mt-5 flex flex-wrap justify-between gap-3"><button type="button" className="rounded-md bg-black/5 px-5 py-3 text-sm font-bold text-ink" onClick={() => step ? setStep(step - 1) : close()}>{step ? "Back" : "Cancel"}</button>{step < 4 ? <button className="btn-crimson" type="submit">Continue <ArrowRight className="h-4 w-4" /></button> : <button className="btn-primary" type="submit">Submit application <CheckCircle2 className="h-4 w-4" /></button>}</div></form></div>;
}

function ApplicationConfirmation({ applicant, email, reference, close, track }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="application-confirmation-title">
    <div className="application-confirmation w-full max-w-3xl rounded-sm border border-green-200 bg-green-50 p-6 shadow-soft sm:p-10">
      <button type="button" className="application-confirmation-close" onClick={close} aria-label="Close confirmation">Ã—</button>
      <CheckCircle2 className="h-12 w-12 text-green-700" />
      <p className="eyebrow mt-5 text-green-800">Application received</p>
      <h2 id="application-confirmation-title" className="mt-2 text-3xl font-black text-ink sm:text-4xl">Thank you, {applicant}.</h2>
      <p className="mt-3 leading-7 text-black/65">Keep this reference number safe. You will need it to check your application status.</p>
      <div className="mt-5 rounded-sm bg-white p-5 font-heading text-xl font-black text-maroon sm:text-2xl">{reference}</div>
      <p className="mt-4 text-sm leading-6 text-black/65">We have sent a confirmation email to <strong className="text-ink">{email}</strong> with your application details and payment instructions. Please check your inbox and spam folder.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn-crimson" onClick={track}>Track application <ArrowRight className="h-4 w-4" /></button>
        <button type="button" className="rounded-md bg-black/5 px-5 py-3 text-sm font-bold text-ink" onClick={close}>Continue browsing</button>
      </div>
    </div>
  </div>;
}
