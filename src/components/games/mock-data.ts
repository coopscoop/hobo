import { emptyPA } from "@/types/constants";
import type { TeamGameData, TeamKey } from "@/types/types";

function roster(names: string[]): TeamGameData["players"] {
  return names.map((name, i) => ({ playerId: `p${i}`, name, innings: {} }));
}

export const mockTeams: Record<TeamKey, TeamGameData> = {
  home: {
    teamId: "t-home",
    name: "Hamilton Oldtimers",
    players: roster([
      "J. Carter",
      "M. Alvarez",
      "D. Reyes",
      "T. Brooks",
      "S. Nguyen",
      "R. Patel",
      "K. Osei",
      "L. Fournier",
      "B. Whitfield",
    ]),
  },
  away: {
    teamId: "t-away",
    name: "Burlington Legends",
    players: roster([
      "A. Bianchi",
      "P. Kowalski",
      "E. Dubois",
      "N. Okafor",
      "G. Sato",
      "W. Reyes",
      "H. Larsson",
      "C. Delgado",
      "F. Marsh",
    ]),
  },
};

// seed a few cells so the grid isn't empty on first load
mockTeams.home.players[0].innings[1] = [{ ...emptyPA(), result: "1B", scored: true }];
mockTeams.home.players[0].innings[3] = [{ ...emptyPA(), result: "HR", rbi: 2, scored: true }];
mockTeams.home.players[1].innings[1] = [{ ...emptyPA(), result: "K" }];
mockTeams.home.players[1].innings[4] = [
  { ...emptyPA(), result: "OUT", sac: true, rbi: 1, scored: false },
  { ...emptyPA(), result: "BB", scored: true },
];
mockTeams.away.players[0].innings[2] = [{ ...emptyPA(), result: "2B", sb3: true, scored: true }];
