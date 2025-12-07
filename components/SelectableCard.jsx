"use client";

export default function SelectableCard({ label, description, recommended = false, selected, onSelect, groupName }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:ring-offset-0
        ${selected
          ? "border-sky-500 bg-sky-50 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}
      `}
    >
      <span
        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold
          ${selected ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300 bg-white text-slate-400"}
        `}
        aria-hidden="true"
      >
        {selected ? "●" : ""}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-900">
          {label}
          {recommended && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Recommended
            </span>
          )}
        </span>
        {description && (
          <span className="text-xs text-slate-500">{description}</span>
        )}
      </span>
      <span className="sr-only">{groupName}</span>
    </button>
  );
}
