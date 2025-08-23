// Path: sms-gateway-project/frontend/src/pages/admin/UserManagementPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import AddUserModal from "../../components/AddUserModal.jsx";
import apiService from "../../services/apiService.js";
import { useToast } from "../../context/ToastContext.jsx";

/**
 * Tailwind replacement for pages/admin/UserManagementPage.jsx
 * - English only, no dark mode
 * - Consistent with Login and AddUserModal styles
 * - Uses your existing apiService endpoints
 * - Create via AddUserModal; Edit via inline EditUserModal (below)
 */

export default function UserManagementPage() {
  const { addToast } = useToast();

  // data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ui state
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // modals
  const [openCreate, setOpenCreate] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiService.getUsers();
      const formatted = (data || []).map((u) => ({
        id: u.ID,
        username: u.Username,
        name: u.Name,
        phone: u.Phone,
        extension: u.Extension,
        department: u.Department,
        api_key: u.APIKey,
        daily_quota: u.DailyQuota,
        is_admin: u.IsAdmin,
        is_active: u.IsActive,
      }));
      setUsers(formatted);
    } catch (e) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filteredSorted = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? users.filter((u) =>
          [u.name, u.username, u.phone, u.department].some((x) => String(x || "").toLowerCase().includes(needle))
        )
      : users;
    const sorted = [...filtered].sort((a, b) => {
      const A = (a[sortKey] ?? "").toString().toLowerCase();
      const B = (b[sortKey] ?? "").toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, q, sortKey, sortDir]);

  // actions
  async function handleCreate(payload) {
    try {
      const dq = payload.daily_quota === "" ? null : Number(payload.daily_quota);
      await apiService.createUser({
        username: payload.username,
        name: payload.name,
        phone: payload.phone,
        extension: payload.extension,
        department: payload.department,
        password: payload.password,
        api_key: payload.api_key,
        daily_quota: dq,
        is_admin: !!payload.is_admin || payload.role === "admin",
        is_active: payload.is_active ?? payload.active ?? true,
      });
      addToast("User created successfully!", "success");
      setOpenCreate(false);
      await load();
    } catch (e) {
      addToast(e?.response?.data?.message || e?.message || "Failed to create user", "error");
    }
  }

  async function handleUpdate(id, payload) {
    try {
      const dq = payload.daily_quota === "" ? null : Number(payload.daily_quota);
      // Build update body and OMIT password if empty → prevents backend failure
      const body = {
        username: payload.username,
        name: payload.name,
        phone: payload.phone,
        extension: payload.extension,
        department: payload.department,
        api_key: payload.api_key,
        daily_quota: dq,
        is_admin: payload.is_admin,
        is_active: payload.is_active,
      };
      if (payload.password) body.password = payload.password;

      await apiService.updateUser(id, body);
      addToast("User updated successfully!", "success");
      setEditingUser(null);
      await load();
    } catch (e) {
      addToast(e?.response?.data?.message || e?.message || "Failed to update user", "error");
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Delete user "${user.username}"?`)) return;
    try {
      await apiService.deleteUser(user.id);
      addToast("User deleted successfully!", "success");
      await load();
    } catch (e) {
      addToast(e?.response?.data?.message || e?.message || "Failed to delete user", "error");
    }
  }

  async function handleToggleActive(user) {
    try {
      if (user.is_active) {
        await apiService.deactivateUser(user.id);
        addToast("User deactivated successfully!", "success");
      } else {
        await apiService.activateUser(user.id);
        addToast("User activated successfully!", "success");
      }
      await load();
    } catch (e) {
      addToast(e?.response?.data?.message || e?.message || "Failed to toggle user", "error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="ltr">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-600">Manage users and their access levels.</p>
          </div>
          <button
            onClick={() => setOpenCreate(true)}
            className="rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:shadow-md"
          >
            Add user
          </button>
        </div>

        {/* Card */}
        <section className="rounded-2xl bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/5">
          <div className="p-4 md:p-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search users..."
                  className="w-72 max-w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-slate-600">Total: {users.length}</div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-700">
                    <Th onClick={() => onSort('name')} active={sortKey==='name'} dir={sortDir}>Name</Th>
                    <Th onClick={() => onSort('username')} active={sortKey==='username'} dir={sortDir}>Username</Th>
                    <Th onClick={() => onSort('phone')} active={sortKey==='phone'} dir={sortDir}>Phone</Th>
                    <Th onClick={() => onSort('extension')} active={sortKey==='extension'} dir={sortDir}>Extension</Th>
                    <Th onClick={() => onSort('department')} active={sortKey==='department'} dir={sortDir}>Department</Th>
                    <Th onClick={() => onSort('api_key')} active={sortKey==='api_key'} dir={sortDir}>API Key</Th>
                    <Th onClick={() => onSort('daily_quota')} active={sortKey==='daily_quota'} dir={sortDir}>Daily Quota</Th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading && (
                    <tr><td colSpan={8} className="px-3 py-10 text-center text-slate-500">Loading…</td></tr>
                  )}

                  {!loading && filteredSorted.length === 0 && (
                    <tr><td colSpan={8} className="px-3 py-10 text-center text-slate-500">No users found</td></tr>
                  )}

                  {!loading && filteredSorted.map((u) => (
                    <tr key={u.id} className={u.is_active ? "hover:bg-slate-50" : "hover:bg-slate-50 opacity-70"}>
                      <td className="px-3 py-2 font-medium text-slate-900">{u.name || '-'}</td>
                      <td className="px-3 py-2 text-slate-700">{u.username}</td>
                      <td className="px-3 py-2 text-slate-700">{u.phone || '-'}</td>
                      <td className="px-3 py-2 text-slate-700">{u.extension || '-'}</td>
                      <td className="px-3 py-2 text-slate-700">{u.department || '-'}</td>
                      <td className="px-3 py-2 text-slate-700">{u.api_key || '-'}</td>
                      <td className="px-3 py-2 text-slate-700">{u.daily_quota ?? '-'}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:shadow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:shadow"
                          >
                            {u.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="rounded-xl bg-rose-600 text-white px-3 py-1.5 text-sm hover:shadow"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Create Modal */}
      <AddUserModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={handleCreate}
      />

      {/* Edit Modal */}
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(payload) => handleUpdate(editingUser.id, payload)}
      />
    </div>
  );
}

function Th({ children, onClick, active, dir }) {
  return (
    <th className="px-3 py-2 select-none cursor-pointer" onClick={onClick} title="Sort">
      <span className="inline-flex items-center gap-1">
        {children}
        {active && (<span aria-hidden="true" className="text-slate-400">{dir === 'asc' ? '▲' : '▼'}</span>)}
      </span>
    </th>
  );
}

// Inline Tailwind Edit Modal tailored to your fields
function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(() => initial(user));
  const [error, setError] = useState("");

  useEffect(() => { setForm(initial(user)); setError(""); }, [user]);
  if (!user) return null;

  function initial(u) {
    if (!u) return {
      username: "", name: "", phone: "", extension: "", department: "",
      password: "", api_key: "", daily_quota: "", is_admin: false, is_active: true,
    };
    return {
      username: u.username || "",
      name: u.name || "",
      phone: u.phone || "",
      extension: u.extension || "",
      department: u.department || "",
      password: "", // optional on edit
      api_key: u.api_key || "",
      daily_quota: u.daily_quota ?? "",
      is_admin: !!u.is_admin,
      is_active: !!u.is_active,
    };
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    if (!form.username.trim()) return "Username is required";
    if (form.daily_quota !== "" && Number.isNaN(Number(form.daily_quota))) return "Daily quota must be a number";
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError("");

    // Build payload and OMIT password if empty
    const payload = {
      username: form.username,
      name: form.name,
      phone: form.phone,
      extension: form.extension,
      department: form.department,
      api_key: form.api_key,
      daily_quota: form.daily_quota,
      is_admin: form.is_admin,
      is_active: form.is_active,
    };
    if (form.password) payload.password = form.password;

    await onSave(payload);
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
          <form onSubmit={submit} className="p-6 md:p-8 space-y-5" noValidate>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-user-title" className="text-xl font-semibold text-slate-900">Edit user</h2>
                <p className="mt-1 text-sm text-slate-600">Update user details.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100">×</button>
            </div>

            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="username">Username</label>
                <input id="username" name="username" value={form.username} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="extension">Extension</label>
                <input id="extension" name="extension" value={form.extension} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="department">Department</label>
                <input id="department" name="department" value={form.department} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">Password (optional)</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="api_key">API Key</label>
                <input id="api_key" name="api_key" value={form.api_key} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="daily_quota">Daily Quota</label>
                <input id="daily_quota" name="daily_quota" value={form.daily_quota} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input id="is_admin" name="is_admin" type="checkbox" checked={form.is_admin} onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-600" />
                <label htmlFor="is_admin" className="text-sm text-slate-700">Admin</label>
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-600" />
                <label htmlFor="is_active" className="text-sm text-slate-700">Active</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 hover:shadow">Cancel</button>
              <button type="submit" className="rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:shadow-md">Save changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
