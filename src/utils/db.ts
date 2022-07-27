import { ExtendedClient } from "../structures/Client";
import { GAME_LIST } from "./gameList";

const client = new ExtendedClient();

export const db = client.connectToDataBase();

export async function fetchUsersInQueue() {
  const { data } = await await db
    .from("users")
    .select("*")
    .eq("in_match", false);
  return data;
}

export async function fetchUsersInQueue4v4() {
  const { data } = await await db
    .from("users_4v4")
    .select("*")
    .eq("in_match", false);
  return data;
}

export async function fetchUser(user_id) {
  const { data } = await db.from("users").select("*").eq("user_id", user_id);
  return data;
}

export async function fetchUser4v4Feedback(user_id) {
  const { data } = await db
    .from("lobbys")
    .select("result, user_id")
    .match({ user_id: user_id });
  return data;
}

export async function fetchUsersQtd(table, qtd, guildId?: string) {
  const { data } = await db
    .from(table)
    .select("*")
    .eq("in_match", false)
    .eq("guild_id", guildId)
    .order("created_at", { ascending: true })
    .limit(qtd);
  return data;
}

export async function resetQueue(table, guild_id) {
  const { data } = await db.from(table).delete().match({ guild_id: guild_id });

  return data;
}

export async function getAllMembersOnEvent() {
  const { data } = await db.from("users_4v4").select("user_id, in_match");

  return data;
}

export async function createUser(user_id, name, guild_id) {
  const { data } = await db.from("users").insert({
    user_id: user_id,
    name: name,
    in_match: false,
    guild_id,
  });
  return data;
}

export async function createUser4v4(user_id, name, guild_id) {
  const { data } = await db.from("users_4v4").insert({
    user_id: user_id,
    name: name,
    guild_id,
    in_match: false,
  });
  return data;
}

export async function updateModerator(user_id, moderator_id) {
  const { data } = await db
    .from("users_4v4")
    .update({
      moderator_id: moderator_id,
    })
    .match({
      user_id: user_id,
    });
  return data;
}

export async function removeUsersFromCategory(category_id) {
  const { data } = await db
    .from("users_4v4")
    .delete()
    .eq("category_id", category_id);

  return data;
}

export async function fetchUsersFromCategory(category_id) {
  const { data } = await db
    .from("users_4v4")
    .select("*")
    .eq("category_id", category_id);

  return data;
}

export async function createUserQueue(
  user_id,
  channel_id,
  guild_id,
  channel_name,
  moderator_id
) {
  const { data } = await db.from("users_queue").insert({
    user_id: user_id,
    channel_id: channel_id,
    guild_id: guild_id,
    channel_name: channel_name,
    moderator_id: moderator_id,
  });
  return data;
}

export async function verifyUserState(table, user_id, state) {
  const { data } = await db
    .from(table)
    .select("user_id")
    .eq("user_id", user_id)
    .eq("in_match", state);

  return data;
}
export async function verifyUserElegibleToMatch(table) {
  const { data } = await db.from(table).select("user_id").eq("in_match", false);

  return data;
}

export async function verifyUserInMatch(table, user_id) {
  const { data } = await db
    .from(table)
    .select("*")
    .eq("in_match", true)
    .match({ user_id: user_id });

  return data;
}

export async function create4v4Lobby(user_id, category_id, moderator_id, team) {
  const { data } = await db.from("lobbys").insert({
    user_id: user_id,
    category_id: category_id,
    moderator_id: moderator_id,
    team: team,
  });

  return data;
}

export async function updateInMatch(table, user_id, state) {
  const { data } = await db
    .from(table)
    .update({
      in_match: state,
    })
    .match({ user_id: user_id });

  return data;
}

export async function updateWinnerAndFinishTime(winner, category_id) {
  const { data } = await db
    .from("lobbys")
    .update({
      winner: winner,
      finished_at: new Date(),
    })
    .match({ category_id: category_id });
  return data;
}

export async function updateFinishTime(category_id) {
  const { data } = await db
    .from("lobbys")
    .update({
      finished_at: new Date(),
    })
    .match({ category_id: category_id });
  return data;
}

export async function updateResultUser(user_id, category_id, result) {
  const { data } = await db
    .from("lobbys")
    .update({
      result: result,
    })
    .match({ user_id: user_id, category_id: category_id });
  return data;
}

export async function updateUserTeam(user_id, team) {
  const { data } = await db
    .from("users_4v4")
    .update({
      team: team,
    })
    .match({ user_id: user_id });

  return data;
}

export async function updateUserRole(user_id, role_id) {
  const { data } = await db
    .from("users")
    .update({
      role_id: role_id,
    })
    .match({ user_id: user_id });

  return data;
}

export async function updateCategory(user_id, category_id) {
  const { data } = await db
    .from("users_4v4")
    .update({
      category_id: category_id,
    })
    .match({ user_id: user_id });

  return data;
}

export async function updateUserChannel(user_id, channel_id) {
  const { data } = await db
    .from("users")
    .update({
      channel_id: channel_id,
    })
    .match({ user_id: user_id });

  return data;
}

export async function fetchUserInMatch(channel_id) {
  const { data } = await db
    .from("users")
    .select("*")
    .eq("channel_id", channel_id);
  return data;
}

export async function fetchCategory(user_id) {
  const { data } = await db
    .from("users_4v4")
    .select("category_id")
    .eq("user_id", user_id);

  return data;
}

export async function fetchChannels(channel_id) {
  const { data } = await db
    .from("channels_config")
    .select("*")
    .eq("text_channel_id", channel_id);

  return data;
}

export async function fetchUsersInMatch(category_id) {
  const { data } = await db
    .from("users_4v4")
    .select("*")
    .match({ category_id: category_id });

  return data;
}

export async function verifyUserExist(table, user_id) {
  const { data } = await db.from(table).select("*").eq("user_id", user_id);

  return data;
}

export async function clearQueue() {
  const { data } = await db.from("users").delete().eq("in_match", false);

  return data;
}

export async function removeUser(table, user_id) {
  const { data } = await db.from(table).delete().match({ user_id: user_id });
  return data;
}

export async function fetchToCSV(day: string, month: string, year: string) {
  const { data } = await db
    .from("lobbys")
    .select("*")
    .gte("created_at", `${year}-${month}-${day}`)
    .not("result", "in", "(Cancelado)")
    .csv();

  return data;
}

export async function getEndedMatch(category_id) {
  const { data } = await db
    .from("ended_matches")
    .select("id, category_id")
    .eq("category_id", category_id)
    .limit(1)
    .single();

  return data;
}

export async function getActionAndMessage(message_id) {
  const { data } = await db
    .from("actions_and_messages")
    .select("id, message_id, action, data")
    .eq("message_id", message_id)
    .limit(1)
    .single();

  return data;
}

export async function createEndedMatch(category_id) {
  const { data } = await db.from("ended_matches").insert({
    category_id,
  });

  return data;
}

export async function createActionAndMessage(
  message_id,
  action,
  dataInput = ""
) {
  const { data } = await db.from("actions_and_messages").insert({
    action,
    message_id,
    data: dataInput,
  });

  return data;
}

export async function isBanned(user_id) {
  const { data } = await db
    .from("users_banned")
    .select("id, user_id, end_date, reason")
    .eq("user_id", user_id)
    .gte("end_date", new Date().toISOString())
    .limit(1)
    .single();

  return data;
}

export async function banUser(user_id, end_date, reason, mod_id) {
  const { data } = await db.from("users_banned").insert({
    user_id,
    end_date,
    reason,
    mod_id,
  });

  return data;
}

export async function updatePontuation(
  user_id,
  game_id: GAME_LIST,
  pontuation,
  type: "win" | "lose"
) {
  const { data } = await db
    .from("users_mmr")
    .select("id, actual_pontuation")
    .eq("user_id", user_id)
    .eq("game_id", game_id)
    .limit(1)
    .single();

  if (data) {
    let actual_pontuation =
      type === "win"
        ? Number(data.actual_pontuation) + Number(pontuation)
        : Number(data.actual_pontuation) - Number(pontuation);

    actual_pontuation = actual_pontuation < 0 ? 0 : actual_pontuation;

    await db
      .from("users_mmr")
      .update({
        actual_pontuation,
        updated_at: new Date(),
      })
      .match({ id: data.id, user_id, game_id });
  } else {
    let actual_pontuation = type === "win" ? pontuation : 0;

    await db.from("users_mmr").insert({
      user_id,
      game_id,
      actual_pontuation,
    });
  }
}

export async function getPontuation(game_id: GAME_LIST) {
  const { data } = await db
    .from("users_mmr")
    .select("user_id, actual_pontuation")
    .eq("game_id", game_id)
    .limit(10)
    .order("actual_pontuation", { ascending: false });

  return data;
}

export async function getPontuationRange(
  table: string,
  range: { start: Date; end: Date }
) {
  const { data } = await db
    .from(table)
    .select("user_id, result")
    .neq("result", null)
    .neq("result", "Cancelado")
    .gte("created_at", range.start.toISOString())
    .lte("created_at", range.end.toISOString());

  const mapaResultados = new Map();

  for (let item of data) {
    const ponto = item.result === "Venceu" ? 1 : -1;

    if (mapaResultados.has(item.user_id)) {
      mapaResultados.set(
        item.user_id,
        mapaResultados.get(item.user_id) + ponto
      );
    } else {
      mapaResultados.set(item.user_id, ponto);
    }
  }

  const rankingArray = [];

  for (const [key, value] of mapaResultados.entries()) {
    rankingArray.push({ user_id: key, actual_pontuation: value });
  }

  const rankingSorted = rankingArray.sort((a, b) => {
    return b.actual_pontuation - a.actual_pontuation;
  });

  return rankingSorted.slice(0, 10);
}

export async function hasCalledMod(category_id) {
  const datePlus2Minutes = new Date(new Date().getTime() + 2 * 60 * 1000);

  const { data } = await db
    .from("button_mod_called")
    .select("id, category_id, called_date")
    .eq("category_id", category_id)
    .lte("called_date", datePlus2Minutes.toISOString())
    .limit(1)
    .single();

  return data;
}

export async function insertCallMod(category_id) {
  const { data } = await db.from("button_mod_called").insert({
    category_id,
  });

  return data;
}

export async function deleteCallsMod() {
  const dateMinus2Minutes = new Date(new Date().getTime() - 2 * 60 * 1000);

  const { data } = await db
    .from("button_mod_called")
    .delete()
    .lte("called_date", dateMinus2Minutes.toISOString());

  return data;
}
