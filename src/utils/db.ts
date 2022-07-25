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

export async function checkUserRolelol(user_id) {
  const { data } = await db
    .from("players_lol")
    .select("user_id")
    .eq("user_id", user_id);

  return data;
}

export async function registerUserOnPlayerslol(user_id, main_role, name) {
  const { data } = await db.from("players_lol").insert({
    user_id: user_id,
    main_role: main_role,
    name: name,
  });

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

export async function createUser5v5(user_id, name, guild_id) {
  const { data } = await db.from("users_5v5").insert({
    user_id: user_id,
    name: name,
    guild_id,
    in_match: false,
  });
  return data;
}

export async function fetchTeam_lol(qtd, guildId) {
  const { data } = await db
    .from("queue_lol")
    .select("*")
    .eq("in_match", false)
    .eq("guild_id", guildId)
    .order("created_at", { ascending: true })
    .limit(qtd);

  return data;
}

export async function fetchSpecificRole(role, guild_id) {
  const { data } = await db
    .from("queue_lol")
    .select("user_id, role")
    .eq("guild_id", guild_id)
    .eq("in_match", false)
    .eq("role", role)
    .order("created_at", { ascending: true })
    .limit(2);

  return data;
}

export async function fetchSpecificRoleSec(role, guild_id, playerId) {
  const { data } = await db
    .from("queue_lol")
    .select("*")
    .eq("guild_id", guild_id)
    .eq("in_match", false)
    .eq("role_sec", role)
    .not("user_id", "in", `(${playerId})`)
    .order("created_at", { ascending: true })
    .limit(2);

  return data;
}

export async function createUser5v5_lol(user_id, name, role, role2, guild_id) {
  const { data } = await db.from("queue_lol").insert({
    user_id: user_id,
    name: name,
    role: role,
    role_sec: role2,
    guild_id,
    in_match: false,
  });
  return data;
}

export async function autoFillRole(guild_id, playerId) {
  const { data } = await db
    .from("queue_lol")
    .select("*")
    .eq("guild_id", guild_id)
    .eq("in_match", false)
    .not("user_id", "in", `(${playerId})`)
    .order("created_at", { ascending: true })
    .limit(10);

  return data;
}

export async function updateModerator(table, user_id, moderator_id) {
  const { data } = await db
    .from(table)
    .update({
      moderator_id: moderator_id,
    })
    .match({
      user_id: user_id,
    });
  return data;
}

export async function updateUserCaptain(
  user_id: string,
  status: string
): Promise<Array<string>> {
  const { data } = await db
    .from("users_5v5")
    .update({ status: status })
    .match({ user_id: user_id });

  return data;
}

export async function verifyCaptainStatus(user_id) {
  const { data } = await db
    .from("users_5v5")
    .select("status")
    .eq("status", "captain")
    .match({ user_id: user_id });
  return data;
}

export async function removeUsersFromCategory(table, category_id) {
  const { data } = await db.from(table).delete().eq("category_id", category_id);

  return data;
}

export async function fetchUsersFromCategory(table, category_id) {
  const { data } = await db
    .from(table)
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

export async function createLobbyLeagueOfLegends(
  user_id: string,
  category_id: string,
  team: string
): Promise<Array<string>> {
  const { data } = await db.from("lobbys_lol").insert({
    user_id: user_id,
    category_id: category_id,
    team: team,
  });

  return data;
}

export async function createLobbyValorant(
  user_id: string,
  category_id: string,
  team: string
): Promise<Array<string>> {
  const { data } = await db.from("lobbys_valorant").insert({
    user_id: user_id,
    category_id: category_id,
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

export async function updateLolRole(user_id: string, role: string) {
  const { data } = await db
    .from("queue_lol")
    .update({ role: role })
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

export async function updateResultUser(table, user_id, category_id, result) {
  const { data } = await db
    .from(table)
    .update({
      result: result,
    })
    .match({ user_id: user_id, category_id: category_id });
  return data;
}

export async function updateUserTeam(table, user_id, team) {
  const { data } = await db
    .from(table)
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

export async function updateCategory(table, user_id, category_id) {
  const { data } = await db
    .from(table)
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
