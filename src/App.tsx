import { GitHubActivityCard } from "./components/cards/GitHubActivityCard";
import { ProfileCard } from "./components/cards/ProfileCard";
import { ProjectsCard } from "./components/cards/ProjectsCard";
import { BentoGrid } from "./components/layout/BentoGrid";
import { useGridTemplate } from "./hooks/useGridTemplate";

function App() {
  const grid = useGridTemplate();

  return (
    <main className="min-h-screen bg-[#f5f7f2] text-gray-950">
      <div
        className="h-8 cursor-move select-none"
        data-tauri-drag-region
        aria-hidden="true"
      />
      <BentoGrid columns={grid.columns} rows={grid.rows}>
        <ProfileCard />
        <GitHubActivityCard />
        <ProjectsCard />
      </BentoGrid>
    </main>
  );
}

export default App;
