import { layoutTemplates } from "../../lib/layoutTemplates";
import type { LayoutTemplateId } from "../../types/dashboard";

type LayoutTemplateSelectorProps = {
  selectedId: LayoutTemplateId;
  onSelect: (templateId: LayoutTemplateId) => void;
};

export function LayoutTemplateSelector({
  selectedId,
  onSelect,
}: LayoutTemplateSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="listbox" aria-label="Layout template">
      {layoutTemplates.map((template) => (
        <button
          className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
            selectedId === template.id
              ? "border-accent-500 bg-accent-50 text-accent-700"
              : "border-gray-100 bg-white text-gray-600 hover:border-accent-100"
          }`}
          key={template.id}
          type="button"
          role="option"
          aria-selected={selectedId === template.id}
          onClick={() => onSelect(template.id)}
        >
          {template.name}
          <span className="mt-1 block text-xs font-medium text-gray-400">
            {template.grid.columns}x{template.grid.rows}
          </span>
        </button>
      ))}
    </div>
  );
}
