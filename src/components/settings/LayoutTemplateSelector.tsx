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
    <div className="grid grid-cols-3 gap-2">
      {layoutTemplates.map((template) => (
        <button
          className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
            selectedId === template.id
              ? "border-accent-500 bg-accent-50 text-accent-700"
              : "border-gray-100 bg-white text-gray-600 hover:border-accent-100"
          }`}
          key={template.id}
          type="button"
          onClick={() => onSelect(template.id)}
        >
          {template.name}
        </button>
      ))}
    </div>
  );
}
