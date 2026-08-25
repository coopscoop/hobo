import EditGamePage from "@/components/games/EditGamePage";
import { mockTeams } from "@/components/games/mock-data";

export default function demo() {
  return <EditGamePage gameId="demo" initialTeams={mockTeams} />;
}
