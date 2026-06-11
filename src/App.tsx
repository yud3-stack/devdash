import { useState } from "react";
import { Settings } from "lucide-react";
import { CalendarTasksCard } from "./components/cards/CalendarTasksCard";
import { FocusPomodoroCard } from "./components/cards/FocusPomodoroCard";
import { GitHubActivityCard } from "./components/cards/GitHubActivityCard";
import { ProfileCard } from "./components/cards/ProfileCard";
import { ProjectsCard } from "./components/cards/ProjectsCard";
import { XFeedCard } from "./components/cards/XFeedCard";
import { BentoGrid } from "./components/layout/BentoGrid";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { useDashboardLayout } from "./hooks/useDashboardLayout";
import { useGitHubToken } from "./hooks/useGitHubToken";
import { useProjectSettings } from "./hooks/useProjectSettings";
import { useXBearerToken } from "./hooks/useXBearerToken";
import type { CardLayout } from "./types/dashboard";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    layout,
    resetLayout,
    resizeCard,
    selectTemplate,
    updateGridSize,
  } = useDashboardLayout();
  const { githubToken, setGitHubToken } = useGitHubToken();
  const {
    addProjectFolder,
    editorCommand,
    projectFolders,
    removeProjectFolder,
    setEditorCommand,
  } = useProjectSettings();
  const { setXBearerToken, xBearerToken } = useXBearerToken();

  function renderCard(cardLayout: CardLayout) {
    if (cardLayout.id === "profile") {
      return <ProfileCard key={cardLayout.id} layout={cardLayout} />;
    }

    if (cardLayout.id === "projects") {
      return (
        <ProjectsCard
          editorCommand={editorCommand}
          key={cardLayout.id}
          layout={cardLayout}
          onResize={(axis, delta) => resizeCard("projects", axis, delta)}
          projects={projectFolders}
        />
      );
    }

    if (cardLayout.id === "githubActivity") {
      return (
        <GitHubActivityCard
          githubToken={githubToken}
          key={cardLayout.id}
          layout={cardLayout}
          onResize={(axis, delta) =>
            resizeCard("githubActivity", axis, delta)
          }
        />
      );
    }

    if (cardLayout.id === "calendarTasks") {
      return (
        <CalendarTasksCard
          key={cardLayout.id}
          layout={cardLayout}
          onResize={(axis, delta) => resizeCard("calendarTasks", axis, delta)}
        />
      );
    }

    if (cardLayout.id === "xFeed") {
      return (
        <XFeedCard
          key={cardLayout.id}
          layout={cardLayout}
          onResize={(axis, delta) => resizeCard("xFeed", axis, delta)}
          xBearerToken={xBearerToken}
        />
      );
    }

    return (
      <FocusPomodoroCard
        key={cardLayout.id}
        layout={cardLayout}
        onResize={(axis, delta) => resizeCard("focusPomodoro", axis, delta)}
      />
    );
  }

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
        {layout.cards.map((cardLayout) => renderCard(cardLayout))}
      </BentoGrid>
      <SettingsPanel
        editorCommand={editorCommand}
        layout={layout}
        open={settingsOpen}
        projectFolders={projectFolders}
        onAddProjectFolder={addProjectFolder}
        onClose={() => setSettingsOpen(false)}
        onEditorCommandChange={setEditorCommand}
        onGridChange={updateGridSize}
        githubToken={githubToken}
        onGitHubTokenChange={setGitHubToken}
        onRemoveProjectFolder={removeProjectFolder}
        onResetLayout={resetLayout}
        onTemplateSelect={selectTemplate}
        onXBearerTokenChange={setXBearerToken}
        xBearerToken={xBearerToken}
      />
    </main>
  );
}

export default App;
