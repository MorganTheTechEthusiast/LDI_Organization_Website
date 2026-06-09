import { Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import Logo from "../../components/Logo.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@liberiadigitalinsights.org", password: "Admin@12345" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("ldi_token", data.token);
      localStorage.setItem("ldi_user", JSON.stringify(data.user));
      navigate("/admin");
    } catch {
      setError("Invalid login credentials.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Logo size="login" />
          <div className="grid h-12 w-12 place-items-center rounded-md bg-maroon text-white">
            <Lock className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-ink">LDI Admin Login</h1>
        <p className="mt-2 text-sm text-black/60">Manage news, events, team members, gallery, partners, and contact messages.</p>
        <div className="mt-6 grid gap-4">
          <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
          <input className="field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
        </div>
        {error && <p className="mt-4 text-sm font-semibold text-maroon">{error}</p>}
        <button className="btn-primary mt-6 w-full" type="submit">Login</button>
      </form>
    </main>
  );
}
