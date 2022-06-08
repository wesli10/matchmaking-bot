import { table } from "console";
import { ExtendedClient } from "../structures/Client";

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
    .gte("created_at", `${year}-${month}-${day} 19:00:00`)
    .csv();

  return data;
}
