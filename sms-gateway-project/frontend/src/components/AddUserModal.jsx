import React, { useEffect, useRef, useState } from "react";

/**
 * Tailwind-only modal for creating a new user (aligned with repo fields).
 * English only, no dark mode.
 *
 * Fields (payload keys match backend):
 *  - username (string, required)
 *  - name (string)
 *  - phone (string)
 *  - extension (string)
 *  - department (string)
 *  - password (string, required)
 *  - api_key (string)
 *  - daily_quota (number | null)
 *  - is_admin (boolean)
 *  - is_active (boolean)
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onCreate: (payload) => Promise<void>
 */
export default function AddUserModal({ isOpen, onClose, onCreate }) {
  const dialogRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    name: "",
    phone: "",
    extension: "",
    department: "",
    password: "",
    api_key: "",
    daily_quota: "", // keep as string for input; convert to number/null on submit
    is_admin: false,
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      const first = dialogRef.current?.querySelector("input, select, button");
      first?.focus();
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    if (!form.username.trim()) return "Username is required";
    if (!form.password) return "Password is required";
    if (form.daily_quota !== "" && Number.isNaN(Number(form.daily_quota))) return "Daily quota must be a number";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        username: form.username.trim(),
        name: form.name.trim() || "",
        phone: form.phone.trim() || "",
        extension: form.extension.trim() || "",
        department: form.department.trim() || "",
        password: form.password,
        api_key: form.api_key.trim() || "",
        daily_quota: form.daily_quota === "" ? null : Number(form.daily_quota),
        is_admin: !!form.is_admin,
        is_active: !!form.is_active,
      };
      await onCreate(payload);
      onClose();
      setForm({ username: "", name: "", phone: "", extension: "", department: "", password: "", api_key: "", daily_quota: "", is_admin: false, is_active: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create user";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="add-user-title" onKeyDown={onKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={dialogRef} className="w-full max-w-2xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5" noValidate>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="add-user-title" className="text-xl font-semibold text-slate-900">Create new user</h2>
                <p className="mt-1 text-sm text-slate-600">Fill in the details to add a new user.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100">×</button>
            </div>

            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
                <input id="username" name="username" type="text" autoComplete="username" value={form.username} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" required />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>

              <div>
                <label htmlFor="extension" className="block text-sm font-medium text-slate-700 mb-1">Extension</label>
                <input id="extension" name="extension" type="text" value={form.extension} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input id="department" name="department" type="text" value={form.department} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" required />
              </div>

              <div>
                <label htmlFor="api_key" className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                <input id="api_key" name="api_key" type="text" value={form.api_key} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>

              <div>
                <label htmlFor="daily_quota" className="block text-sm font-medium text-slate-700 mb-1">Daily Quota</label>
                <input id="daily_quota" name="daily_quota" type="number" min="0" inputMode="numeric" value={form.daily_quota} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>

              <div className="flex items-center gap-2 pt-7">
                <input id="is_admin" name="is_admin" type="checkbox" checked={form.is_admin} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-600" />
                <label htmlFor="is_admin" className="text-sm text-slate-700">Admin</label>
              </div>

              <div className="flex items-center gap-2 pt-7">
                <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-600" />
                <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 hover:shadow">Cancel</button>
              <button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:shadow-md disabled:opacity-70">
                {submitting ? "Creating…" : "Create user"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
