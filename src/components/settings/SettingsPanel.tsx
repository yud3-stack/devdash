import { Columns3, Minus, Plus, RotateCcw, Rows3, X } from "lucide-react";
import type { ReactNode } from "react";
import { LayoutTemplateSelector } from "./LayoutTemplateSelector";
import { gridLimits } from "../../lib/layoutTemplates";
import type {
  DashboardLayoutState,
  GridSize,
  LayoutTemplateId,
} from "../../types/dashboard";

type SettingsPanelProps = {
  layout: DashboardLayoutState;
  onClose: () => void;
  onGridChange: (grid: GridSize) => void;
  onResetLayout: () => void;
  onTemplateSelect: (templateId: LayoutTemplateId) => void;
  open: boolean;
};

export function SettingsPanel({
  layout,
  onClose,
  onGridChange,
  onResetLayout,
  onTemplateSelect,
  open,
}: SettingsPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 bg-gray-950/10">
      <aside className="absolute right-4 top-10 flex w-[360px] flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-950">Settings</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-gray-100 text-gray-500 transition hover:border-accent-100 hover:text-accent-700"
            type="button"
            aria-label="Close settings"
            title="Close settings"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-accent-600">
            Layout Template
          </h3>
          <LayoutTemplateSelector
            selectedId={layout.layoutTemplateId}
            onSelect={onTemplateSelect}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-accent-600">
            Grid Size
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <GridStepper
              icon={<Columns3 size={16} />}
              label="Columns"
              max={gridLimits.columns.max}
              min={gridLimits.columns.min}
              value={layout.grid.columns}
              onChange={(columns) =>
                onGridChange({ ...layout.grid, columns })
              }
            />
            <GridStepper
              icon={<Rows3 size={16} />}
              label="Rows"
              max={gridLimits.rows.max}
              min={gridLimits.rows.min}
              value={layout.grid.rows}
              onChange={(rows) => onGridChange({ ...layout.grid, rows })}
            />
          </div>
        </section>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-100 text-sm font-semibold text-gray-600 transition hover:border-accent-100 hover:bg-accent-50 hover:text-accent-700"
          type="button"
          onClick={onResetLayout}
        >
          <RotateCcw size={15} />
          Reset Layout
        </button>
      </aside>
    </div>
  );
}

type GridStepperProps = {
  icon: ReactNode;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
};

function GridStepper({
  icon,
  label,
  max,
  min,
  onChange,
  value,
}: GridStepperProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          className="grid h-8 w-8 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 transition hover:border-accent-100 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          title={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus size={14} />
        </button>
        <strong className="text-xl font-extrabold text-gray-950">{value}</strong>
        <button
          className="grid h-8 w-8 place-items-center rounded-full border border-gray-100 bg-white text-gray-500 transition hover:border-accent-100 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          title={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
