import { X } from "lucide-react";
import { RESULTS, RESULT_CHIP_STYLE } from "@/types/constants";
import type { PlateAppearance } from "@/types/types";

interface Props {
  label: string;
  pa: PlateAppearance;
  onChange: (patch: Partial<PlateAppearance>) => void;
  onRemove?: () => void;
}

export function AtBatFields({ label, pa, onChange, onRemove }: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-neutral-700 bg-neutral-800/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">{label}</span>
        {onRemove && (
          <button onClick={onRemove} className="text-neutral-500 hover:text-neutral-200" title="Remove this at-bat">
            <X size={16} />
          </button>
        )}
      </div>

      <Section label="Result">
        <div className="flex flex-wrap gap-1.5">
          {RESULTS.map((r) => (
            <button
              key={r.code}
              data-on={pa.result === r.code}
              onClick={() => onChange({ result: r.code })}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${RESULT_CHIP_STYLE[r.group]}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Flags">
        <div className="flex gap-1.5">
          {(
            [
              ["sac", "Sacrifice"],
              ["fc", "Fielder's Choice"],
            ] as const
          ).map(([key, flagLabel]) => (
            <button
              key={key}
              onClick={() => onChange({ [key]: !pa[key] })}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                pa[key] ? "border-neutral-400 bg-neutral-500 text-white" : "border-neutral-600 text-neutral-300"
              }`}
            >
              {flagLabel}
            </button>
          ))}
        </div>
      </Section>

      <Section label="RBI">
        <div className="flex gap-1.5">
          {([0, 1, 2, 3, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => onChange({ rbi: n })}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                pa.rbi === n ? "border-neutral-400 bg-neutral-500 text-white" : "border-neutral-600 text-neutral-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Stolen bases">
        <div className="flex gap-1.5">
          {(
            [
              ["sb2", "2nd"],
              ["sb3", "3rd"],
              ["sbHome", "Home"],
            ] as const
          ).map(([key, sbLabel]) => (
            <button
              key={key}
              onClick={() => onChange({ [key]: !pa[key] })}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                pa[key] ? "border-neutral-400 bg-neutral-500 text-white" : "border-neutral-600 text-neutral-300"
              }`}
            >
              {sbLabel}
            </button>
          ))}
        </div>
      </Section>

      <div className="flex items-center justify-between border-t border-neutral-700 pt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Scored</span>
        <button
          onClick={() => onChange({ scored: !pa.scored })}
          className={`relative h-6 w-11 rounded-full transition-colors ${pa.scored ? "bg-emerald-500" : "bg-neutral-600"}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              pa.scored ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</div>
      {children}
    </div>
  );
}
