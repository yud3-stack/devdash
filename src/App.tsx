import { useState } from "react";
import { Settings } from "lucide-react";
import { GitHubActivityCard } from "./components/cards/GitHubActivityCard";
import { ProfileCard } from "./components/cards/ProfileCard";
import { ProjectsCard } from "./components/cards/ProjectsCard";
import { BentoGrid } from "./components/layout/BentoGrid";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { useDashboardLayout } from "./hooks/useDashboardLayout";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    cardLayouts,
    layout,
    resetLayout,
    resizeCard,
    selectTemplate,
    updateGridSize,
  } = useDashboardLayout();

  return (
    <main className="min-h-screen bg-[#f5f7f2] text-gray-950">
      <div className="relative h-8 select-none">
        <div
          className="absolute inset-0 cursor-move"
          data-tauri-drag-region
          aria-hidden="true"
        />
        <button
          className="absolute right-4 top-1 z-10 grid h-6 w-6 place-items-center rounded-full text-gray-400 transition hover:bg-white hover:text-accent-700"
          type="button"
          aria-label="Open settings"
          title="Open settings"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={15} />
        </button>
      </div>
      <BentoGrid columns={layout.grid.columns} rows={layout.grid.rows}>
        <ProfileCard layout={cardLayouts.profile} />
        <GitHubActivityCard
          layout={cardLayouts.githubActivity}
          onResize={(axis, delta) =>
            resizeCard("githubActivity", axis, delta)
          }
        />
        <ProjectsCard
          layout={cardLayouts.projects}
          onResize={(axis, delta) => resizeCard("projects", axis, delta)}
        />
      </BentoGrid>
      <SettingsPanel
        layout={layout}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onGridChange={updateGridSize}
        onResetLayout={resetLayout}
        onTemplateSelect={selectTemplate}
      />
    </main>
  );
}

export default App;
