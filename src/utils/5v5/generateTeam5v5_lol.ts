import { autoFillRole, fetchSpecificRole, fetchSpecificRoleSec } from "../db";

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
const roles = ["Mid-laner", "Support", "AD Carry", "Jungler", "Top-laner"];

export async function generateTeam5v5_lol(guildId: string) {
  let mid = shuffleArray(await fetchSpecificRole("Mid-laner", guildId));
  let sup = shuffleArray(await fetchSpecificRole("Support", guildId));
  let adc = shuffleArray(await fetchSpecificRole("AD Carry", guildId));
  let jg = shuffleArray(await fetchSpecificRole("Jungler", guildId));
  let top = shuffleArray(await fetchSpecificRole("Top-laner", guildId));

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
    mid.shift(),
    sup.shift(),
    adc.shift(),
    jg.shift(),
    top.shift(),
  ];

  const time2 = [
    mid.shift(),
    sup.shift(),
    adc.shift(),
    jg.shift(),
    top.shift(),
  ];

  const playersId = [...time1, ...time2].map((player) => player?.user_id);

  for await (const player of time1) {
    if (player !== undefined) {
      continue;
    }
    const found = shuffleArray(await autoFillRole(guildId, playersId));
    if (found.length === 0) {
      return;
    }
    const playerFound = found.shift();
    playersId.push(playerFound.user_id);
    const idx = playersId.indexOf(player);
    playerFound.role = roles[idx];
    time1[idx] = playerFound;
  }

  for await (const player of time2) {
    if (player !== undefined) {
      continue;
    }
    const found = shuffleArray(await autoFillRole(guildId, playersId));
    if (found.length === 0) {
      return;
    }
    const playerFound = found.shift();
    playersId.push(playerFound?.user_id);

    const idx = playersId.indexOf(player);
    playerFound.role = roles[idx];
    time2[idx] = playerFound;
  }

  return {
    time1: time1,
    time2: time2,
  };
}
