import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const control = "w-full rounded-xl border bg-white px-3.5 outline-none transition focus:border-brand-500";
const border = (error?: string) => (error ? "border-sale" : "border-line");

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid content-start gap-1.5 text-sm font-medium">
      {label}
      {children}
      {error ? <span className="text-xs font-semibold text-sale">{error}</span> : hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ error, ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input {...props} aria-invalid={!!error} className={`${control} ${border(error)} h-12`} />;
}

export function Select({ error, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select {...props} aria-invalid={!!error} className={`${control} ${border(error)} h-12`}>
      {children}
    </select>
  );
}

export function TextArea({ error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea {...props} aria-invalid={!!error} className={`${control} ${border(error)} py-3`} />;
}
