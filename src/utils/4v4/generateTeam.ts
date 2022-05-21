import { DISCORD_CONFIG } from "../../configs/discord.config";
import { fetchUsersQtd } from "../db";

function shuffleArray(arr) {
  // Loop em todos os elementos
  for (let i = arr.length - 1; i > 0; i--) {
    // Escolhendo elemento aleatório
    const j = Math.floor(Math.random() * (i + 1));
    // Reposicionando elemento
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Retornando array com aleatoriedade
  return arr;
}

export async function generateTeam(guildId: string) {
  const qtd = DISCORD_CONFIG.numbers.MIN_NUM_PLAYERS_TO_START_LOBBY;
  const dataAll = await fetchUsersQtd("users_4v4", qtd, guildId);
  const metade = qtd / 2;

  const players = shuffleArray(dataAll);

  return players.map((player, index) => {
    if (index < metade) {
      return {
        ...player,
        team: 1,
      };
    } else {
      return {
        ...player,
        team: 2,
      };
    }
  });
}
