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

export async function fetchUsersQtd(qtd) {
  const { data } = await await db
    .from("users")
    .select("*")
    .eq("in_match", false)
    .limit(qtd);
  return data;
}

export async function createUser(user_id, name) {
  const { data } = await db.from("users").insert({
    user_id: user_id,
    name: name,
  });
  return data;
}

export async function createQueue(channel_id, guild_id) {
  const { data } = await db.from("queues").insert({
    channel_id: channel_id,
    guild_id: guild_id,
  });
  return data;
}

export async function createUserQueue(user_id, channel_id, channel_name) {
  const { data } = await db.from("users_queue").insert({
    user_id: user_id,
    channel_id: channel_id,
    channel_name: channel_name,
  });
  return data;
}

export async function verifyUserState(user_id, state) {
  const { data } = await db
    .from("users")
    .select("user_id")
    .eq("user_id", user_id)
    .eq("in_match", state);

  return data;
}
export async function verifyUserElegibleToMatch() {
  const { data } = await db
    .from("users")
    .select("user_id")
    .eq("in_match", false);

  return data;
}

export async function verifyUserInMatch(user_id) {
  const { data } = await db
    .from("users")
    .select("*")
    .eq("in_match", true)
    .match({ user_id: user_id });

  return data;
}

export async function updateInMatch(user_id, state) {
  const { data } = await db
    .from("users")
    .update({
      in_match: state,
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

export async function verifyUserExist(user_id) {
  const { data } = await db.from("users").select("*").eq("user_id", user_id);

  return data;
}

export async function fetchQueues() {
  const { data } = await db.from("queues").select("*");

  return data;
}

export async function clearQueue() {
  const { data } = await db.from("users").delete().eq("in_match", false);

  return data;
}

export async function removeUser(user_id) {
  const { data } = await db.from("users").delete().match({ user_id: user_id });
  return data;
}
