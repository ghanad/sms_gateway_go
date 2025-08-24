// Path: sms-gateway-project/frontend/src/components/providers/ProviderForm.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProviderBase } from '../../lib/validation/provider';
import { providerCreateSchema, providerUpdateSchema } from '../../lib/validation/provider';

/**
 * Tailwind modal for creating/updating a Provider (MUI-free, RHF+Zod preserved)
 * Props (unchanged):
 *  - open: boolean
 *  - onClose: () => void
 *  - initialData?: (ProviderBase & { id?: string })
 *  - onSuccess: (body: Record<string, unknown>) => Promise<void>
 *
 * UX fixes:
 *  - Scrollable panel: max-h-[90vh] + overflow-y-auto
 *  - Sticky header/footer so actions are always visible
 */

interface ProviderFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: (ProviderBase & { id?: string });
  onSuccess: (body: Record<string, unknown>) => Promise<void>;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ open, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData?.id;
  const [changePassword, setChangePassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const panelRef = useRef<HTMLDivElement>(null);

  const schema = useMemo(() => (isEdit ? providerUpdateSchema : providerCreateSchema), [isEdit]);

  const { control, handleSubmit, watch, setValue, formState: { errors, isDirty }, reset } = useForm<ProviderBase>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      type: 'magfa',
      is_enabled: true,
      base_url: 'https://sms.magfa.com',
      endpoint_path: '/api/http/sms/v2/send',
      auth_type: 'basic',
      priority: 100,
      timeout_ms: 10000,
      retries: 2,
      retry_backoff_ms: 500,
      extra_headers_json: { 'Cache-Control': 'no-cache', 'Accept': 'application/json' },
    },
  });

  useEffect(() => {
    if (open) {
      reset(initialData || {
        type: 'magfa', is_enabled: true, base_url: 'https://sms.magfa.com', endpoint_path: '/api/http/sms/v2/send',
        auth_type: 'basic', priority: 100, timeout_ms: 10000, retries: 2, retry_backoff_ms: 500,
        extra_headers_json: { 'Cache-Control': 'no-cache', 'Accept': 'application/json' },
      });
      setChangePassword(false);
      setError('');
      // focus first input
      setTimeout(() => { panelRef.current?.querySelector<HTMLInputElement>('input,select,textarea,button')?.focus(); }, 0);
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open, initialData, reset]);

  function compact(body: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (v === undefined || v === null) continue;
      if (typeof v === 'string' && v.trim() === '') continue;
      out[k] = v;
    }
    return out;
  }

  const onSubmit = async (data: ProviderBase) => {
    try {
      setSubmitting(true);
      setError('');
      const body: Record<string, unknown> = { ...data };
      if (isEdit && !changePassword) {
        delete body.basic_password; // keep current password on server
      }
      await onSuccess(compact(body));
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to save provider';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="provider-form-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel Wrapper (scrollable viewport) */}
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        {/* Panel */}
        <div ref={panelRef} className="w-full max-w-2xl my-8 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-5" noValidate>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 -mx-6 md:-mx-8 px-6 md:px-8 py-4 bg-white border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <h2 id="provider-form-title" className="text-xl font-semibold text-slate-900">{isEdit ? 'Edit Provider' : 'New Provider'}</h2>
                <p className="mt-1 text-sm text-slate-600">Configure provider connection and defaults.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100">×</button>
            </div>

            {error && (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>
            )}

            {/* Basics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller name="name" control={control} render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">Name</label>
                  <input id="name" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                  {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message as string}</p>}
                </div>
              )} />

              <Controller name="type" control={control} render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="type">Type</label>
                  <select id="type" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent">
                    <option value="magfa">Magfa</option>
                  </select>
                  {errors.type && <p className="mt-1 text-xs text-rose-600">{errors.type.message as string}</p>}
                </div>
              )} />

              <Controller name="is_enabled" control={control} render={({ field }) => (
                <label className="flex items-center gap-2 pt-7 select-none">
                  <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-600" />
                  <span className="text-sm text-slate-700">Enabled</span>
                </label>
              )} />

              <Controller name="base_url" control={control} render={({ field }) => (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="base_url">Base URL</label>
                  <input id="base_url" {...field} placeholder="https://api.example.com" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                  {errors.base_url && <p className="mt-1 text-xs text-rose-600">{errors.base_url.message as string}</p>}
                </div>
              )} />

              <Controller name="endpoint_path" control={control} render={({ field }) => (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="endpoint_path">Endpoint Path</label>
                  <input id="endpoint_path" {...field} placeholder="/api/http/sms/v2/send" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                  {errors.endpoint_path && <p className="mt-1 text-xs text-rose-600">{errors.endpoint_path.message as string}</p>}
                </div>
              )} />
            </div>

            {/* Auth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Controller name="auth_type" control={control} render={({ field }) => (
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="auth_type">Auth Type</label>
                  <select id="auth_type" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent">
                    <option value="basic">Basic</option>
                    <option value="apikey">API Key</option>
                    <option value="bearer">Bearer</option>
                    <option value="none">None</option>
                  </select>
                </div>
              )} />

              {watch('auth_type') === 'basic' && (
                <>
                  <Controller name="basic_username" control={control} render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="basic_username">Basic Username</label>
                      <input id="basic_username" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                      {errors.basic_username && <p className="mt-1 text-xs text-rose-600">{errors.basic_username.message as string}</p>}
                    </div>
                  )} />

                  {isEdit && !changePassword ? (
                    <div className="sm:col-span-2 flex items-center gap-2 pt-7">
                      <button type="button" onClick={() => { setChangePassword(true); setValue('basic_password',''); }} className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm hover:shadow">Change password</button>
                      <span className="text-xs text-slate-500">Current password will be kept</span>
                    </div>
                  ) : (
                    <Controller name="basic_password" control={control} render={({ field }) => (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="basic_password">Basic Password</label>
                        <input id="basic_password" type="password" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                        <p className="mt-1 text-xs text-slate-500">{isEdit ? 'Leave empty to keep current password' : ''}</p>
                        {errors.basic_password && <p className="mt-1 text-xs text-rose-600">{errors.basic_password.message as string}</p>}
                      </div>
                    )} />
                  )}
                </>
              )}

              {watch('auth_type') === 'apikey' && (
                <Controller name="api_key" control={control} render={({ field }) => (
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="api_key">API Key</label>
                    <input id="api_key" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                    {errors.api_key && <p className="mt-1 text-xs text-rose-600">{errors.api_key.message as string}</p>}
                  </div>
                )} />
              )}

              {watch('auth_type') === 'bearer' && (
                <Controller name="bearer_token" control={control} render={({ field }) => (
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="bearer_token">Bearer Token</label>
                    <input id="bearer_token" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                    {errors.bearer_token && <p className="mt-1 text-xs text-rose-600">{errors.bearer_token.message as string}</p>}
                  </div>
                )} />
              )}
            </div>

            {/* Defaults / Advanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller name="priority" control={control} render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="priority">Priority (0–100)</label>
                  <input id="priority" type="number" min={0} max={100} {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                  {errors.priority && <p className="mt-1 text-xs text-rose-600">{errors.priority.message as string}</p>}
                </div>
              )} />

              <Controller name="default_sender" control={control} render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="default_sender">Default Sender</label>
                  <input id="default_sender" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                  {errors.default_sender && <p className="mt-1 text-xs text-rose-600">{errors.default_sender.message as string}</p>}
                </div>
              )} />

              <Controller name="timeout_ms" control={control} render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="timeout_ms">Timeout (ms)</label>
                  <input id="timeout_ms" type="number" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                  {errors.timeout_ms && <p className="mt-1 text-xs text-rose-600">{errors.timeout_ms.message as string}</p>}
                </div>
              )} />

              <Controller name="retries" control={control} render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="retries">Retries</label>
                  <input id="retries" type="number" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                  {errors.retries && <p className="mt-1 text-xs text-rose-600">{errors.retries.message as string}</p>}
                </div>
              )} />

              <Controller name="retry_backoff_ms" control={control} render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="retry_backoff_ms">Retry Backoff (ms)</label>
                  <input id="retry_backoff_ms" type="number" {...field} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent" />
                  {errors.retry_backoff_ms && <p className="mt-1 text-xs text-rose-600">{errors.retry_backoff_ms.message as string}</p>}
                </div>
              )} />
            </div>

            {/* Extra headers JSON */}
            <Controller name="extra_headers_json" control={control} render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="extra_headers_json">Extra Headers (JSON)</label>
                <textarea
                  id="extra_headers_json"
                  value={JSON.stringify(field.value ?? {}, null, 2)}
                  onChange={(e) => {
                    try { field.onChange(JSON.parse(e.target.value)); } catch { /* ignore invalid json until fixed */ }
                  }}
                  rows={6}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
                />
                {errors.extra_headers_json && <p className="mt-1 text-xs text-rose-600">{errors.extra_headers_json.message as string}</p>}
              </div>
            )} />

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-10 -mx-6 md:-mx-8 px-6 md:px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 hover:shadow">Cancel</button>
              <button type="submit" disabled={submitting || !isDirty} className="rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:shadow-md disabled:opacity-70">
                {submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create provider')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderForm;