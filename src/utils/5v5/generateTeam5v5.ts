import { DISCORD_CONFIG } from "../../configs/discord.config";
import {
  autoFillRole,
  fetchSpecificRole,
  fetchSpecificRoleSec,
  fetchUsersQtd,
} from "../db";

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

export async function generateTeam5v5(guildId: string) {
  const qtd = Number(DISCORD_CONFIG.numbers.MIN_NUM_PLAYERS_TO_5v5_MATCH) | 0;
  const dataAll = await fetchUsersQtd("users_5v5", qtd, guildId);
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

async function getSecondaryRole(role, guildId, playersId, roleList) {
  const sec = shuffleArray(
    await fetchSpecificRoleSec(role, guildId, playersId)
  );
  if (sec) {
    for (let i = 0; i < 2 - roleList.length; i++) {
      const player = sec.shift();
      if (player) {
        player.role = role;
      }

      roleList.push(player);
    }
    roleList = shuffleArray(roleList);
  }

  return roleList;
}
const roles = ["Top-laner", "Jungler", "Mid-laner", "AD Carry", "Support"];

export async function generateTeam5v5_lol(guildId: string) {
  let top = shuffleArray(await fetchSpecificRole("Top-laner", guildId, []));
  let jg = shuffleArray(await fetchSpecificRole("Jungler", guildId, []));
  let mid = shuffleArray(await fetchSpecificRole("Mid-laner", guildId, []));
  let adc = shuffleArray(await fetchSpecificRole("AD Carry", guildId, []));
  let sup = shuffleArray(await fetchSpecificRole("Support", guildId, []));

  if (mid.length < 2) {
    const playersId = [...mid, ...sup, ...adc, ...jg, ...top].map(
      (player) => player?.user_id
    );
    mid = await getSecondaryRole("Mid-laner", guildId, playersId, mid);
  }
  if (sup.length < 2) {
    const playersId = [...mid, ...sup, ...adc, ...jg, ...top].map(
      (player) => player?.user_id
    );
    sup = await getSecondaryRole("Support", guildId, playersId, sup);
  }
  if (adc.length < 2) {
    const playersId = [...mid, ...sup, ...adc, ...jg, ...top].map(
      (player) => player?.user_id
    );
    adc = await getSecondaryRole("AD Carry", guildId, playersId, adc);
  }
  if (jg.length < 2) {
    const playersId = [...mid, ...sup, ...adc, ...jg, ...top].map(
      (player) => player?.user_id
    );
    jg = await getSecondaryRole("Jungler", guildId, playersId, jg);
  }
  if (top.length < 2) {
    const playersId = [...mid, ...sup, ...adc, ...jg, ...top].map(
      (player) => player?.user_id
    );
    top = await getSecondaryRole("Top-laner", guildId, playersId, top);
  }

  const time1 = [
    top.shift(),
    jg.shift(),
    mid.shift(),
    adc.shift(),
    sup.shift(),
  ];

  const time2 = [
    top.shift(),
    jg.shift(),
    mid.shift(),
    adc.shift(),
    sup.shift(),
  ];

  const playersId = [...time1, ...time2].map((player) => player?.user_id);

  for await (const player of time1) {
    if (player !== undefined) {
      continue;
    }
    const idx = time1.indexOf(player);
    const found = shuffleArray(
      await fetchSpecificRole(roles[idx], guildId, playersId)
    );
    if (found.length === 0) {
      return;
    }
    const playerfound = found.shift();
    playersId.push(playerfound.user_id);
    time1[idx] = playerfound;
  }

  for await (const player of time2) {
    if (player !== undefined) {
      continue;
    }
    const idx = time2.indexOf(player);
    const found = shuffleArray(
      await fetchSpecificRole(roles[idx], guildId, playersId)
    );
    if (found.length === 0) {
      return;
    }
    const playerfound = found.shift();
    playersId.push(playerfound.user_id);
    time2[idx] = playerfound;
  }

  return {
    time1: time1,
    time2: time2,
  };
}
