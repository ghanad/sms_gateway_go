// Path: sms-gateway-project/frontend/src/pages/admin/ProvidersPage.jsx

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../lib/api/client";
import useAdminGuard from "../../lib/hooks/useAdminGuard";
import ProviderForm from "../../components/providers/ProviderForm"; // will restyle later
import TestSendDialog from "../../components/providers/TestSendDialog"; // will restyle later

/**
 * Tailwind replacement for ProvidersPage
 * - English only, no dark mode
 * - Keeps your react-query + apiClient endpoints
 * - Table UI + search + simple sort
 * - Actions: Edit (opens ProviderForm), Test (opens TestSendDialog), Audit, Delete
 */

export default function ProvidersPage() {
  const guard = useAdminGuard();
  if (guard) return guard;

  const queryClient = useQueryClient();
  const { data: rows = [], isLoading, error } = useQuery(["providers.list"], async () => {
    const { data, error } = await apiClient.get("/admin/providers");
    if (error) throw error;
    return data || [];
  });

  // ui state
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState();
  const [testProvider, setTestProvider] = useState();

  function onSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filteredSorted = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((r) => [r.name, r.type, r.base_url].some((x) => String(x || "").toLowerCase().includes(needle)))
      : rows;
    const sorted = [...filtered].sort((a, b) => {
      const A = (a[sortKey] ?? "").toString().toLowerCase();
      const B = (b[sortKey] ?? "").toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, q, sortKey, sortDir]);

  async function handleDelete(row) {
    if (!confirm(`Delete provider "${row.name}"?`)) return;
    await apiClient.del("/admin/providers/{id}", { params: { path: { id: row.id } } });
    queryClient.invalidateQueries(["providers.list"]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="ltr">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Providers</h1>
            <p className="text-sm text-slate-600">Manage SMS providers and their settings.</p>
          </div>
          <button
            onClick={() => { setEditing(undefined); setFormOpen(true); }}
            className="rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:shadow-md"
          >
            New provider
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
                  placeholder="Search by name, type, or base URL"
                  className="w-80 max-w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-slate-600">Total: {rows.length}</div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-700">
                    <Th onClick={() => onSort('name')} active={sortKey==='name'} dir={sortDir}>Name</Th>
                    <Th onClick={() => onSort('type')} active={sortKey==='type'} dir={sortDir}>Type</Th>
                    <Th onClick={() => onSort('is_enabled')} active={sortKey==='is_enabled'} dir={sortDir}>Status</Th>
                    <Th onClick={() => onSort('base_url')} active={sortKey==='base_url'} dir={sortDir}>Base URL</Th>
                    <Th onClick={() => onSort('updated_at')} active={sortKey==='updated_at'} dir={sortDir}>Updated At</Th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading && (
                    <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">Loading…</td></tr>
                  )}
                  {error && (
                    <tr><td colSpan={6} className="px-3 py-10 text-center text-rose-600">Failed to load</td></tr>
                  )}
                  {!isLoading && filteredSorted.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">No providers</td></tr>
                  )}
                  {!isLoading && filteredSorted.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-900">{row.name}</td>
                      <td className="px-3 py-2 text-slate-700">{row.type}</td>
                      <td className="px-3 py-2">
                        {row.is_enabled ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs">Enabled</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-xs">Disabled</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        <a href={row.base_url} target="_blank" rel="noreferrer" className="underline decoration-slate-300 hover:decoration-slate-600">
                          {row.base_url || '-'}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{row.updated_at || '-'}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => { setEditing(row); setFormOpen(true); }}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:shadow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setTestProvider(row)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:shadow"
                          >
                            Test
                          </button>
                          <Link
                            to={`/admin/providers/${row.id}/audit`}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:shadow"
                          >
                            Audit
                          </Link>
                          <button
                            onClick={() => handleDelete(row)}
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

      {/* Keep current modals; we'll restyle next */}
      {formOpen && (
        <ProviderForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          initialData={editing}
          onSuccess={async (body) => {
            if (editing) {
              await apiClient.patch("/admin/providers/{id}", { params: { path: { id: editing.id } }, body });
            } else {
              await apiClient.post("/admin/providers", { body });
            }
            queryClient.invalidateQueries(["providers.list"]);
          }}
        />
      )}

      {testProvider && (
        <TestSendDialog
          open={!!testProvider}
          onClose={() => setTestProvider(undefined)}
          onSubmit={async (data) => {
            await apiClient.post("/admin/providers/{id}/test", {
              params: { path: { id: testProvider.id } },
              body: { sender: data.sender, message: data.message, recipients: data.recipients, dry_run: data.dryRun },
            });
          }}
        />
      )}
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
