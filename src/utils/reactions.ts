import { client, emitSentry } from "../index";
import { DISCORD_CONFIG } from "../configs/discord.config";
import {
  createActionAndMessage,
  fetchUsersFromCategory,
  getActionAndMessage,
  removeUsersFromCategory,
  updateCategory,
  updateFinishTime,
  updateInMatch,
  updateModerator,
  updatePontuation,
  updateResultUser,
  updateUserCaptain,
  updateUserTeam,
} from "./db";
import {
  CategoryChannel,
  MessageEmbed,
  MessageReaction,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import {
  embedTime1,
  embedTime2,
  PartidaCancelada,
} from "./4v4/messageInteractionsTemplates";
import { valorantMapsSelectionFunc } from "./5v5/manageMatch";
import {
  dodgeQueueUsersManage,
  leagueOfLegendsFinishLobbyFunc,
  leagueOfLegendsManageUsersFunc,
  removeusersFromChannel,
  valorantFinishMatchFunc,
  valorantStartLobbyFunc,
} from "./5v5/manageUsers";
import { GAME_LIST } from "./gameList";
import { deleteCategory } from "./utils";

const { roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;
const role_event = roles.event;
const role_moderator = roles.moderator;
const role_admin = roles.admin;

export async function globalReactions(reaction, user) {
  // Check type of reaction
  const actionAndMessage = await getActionAndMessage(reaction.message.id);

  if (
    actionAndMessage?.action !== "confirm_finish_match" &&
    actionAndMessage?.action !== "embed_time1" &&
    actionAndMessage?.action !== "embed_time2" &&
    actionAndMessage?.action !== "maps_selection" &&
    actionAndMessage?.action !== "valorant_confirm_presence" &&
    actionAndMessage?.action !== "embed_time1_valorant" &&
    actionAndMessage?.action !== "embed_time2_valorant" &&
    actionAndMessage?.action !== "confirm_finish_match_valorant" &&
    actionAndMessage?.action !== "lol_confirm_presence" &&
    actionAndMessage?.action !== "embed_time1_lol" &&
    actionAndMessage?.action !== "embed_time2_lol" &&
    actionAndMessage?.action !== "confirm_finish_match_lol"
  ) {
    return;
  }

  if (!reaction.message?.channelId) {
    return;
  }

  const channelExists = await client.channels.fetch(
    reaction.message?.channelId
  );

  if (!channelExists) {
    return;
  }

  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
    } catch (error) {
      emitSentry("reactionFetch", "Tried to fetch a reaction", error);
      console.error("Something went wrong when fetching the message:", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  if (reaction instanceof MessageReaction) {
    try {
      const sendMessage = await reaction.message.fetch();

      if (actionAndMessage?.action === "confirm_finish_match") {
        await confirmFinishMatch(reaction, user, sendMessage);
      }

      if (actionAndMessage?.action === "embed_time1") {
        await embedTime1Func(reaction, user, sendMessage, actionAndMessage);
      }

      if (actionAndMessage?.action === "embed_time2") {
        await embedTime2Func(reaction, user, sendMessage, actionAndMessage);
      }

      // LEAGUE OF LEGENDS FUNCTIONS

      if (actionAndMessage?.action === "lol_confirm_presence") {
        await leagueOfLegendsConfirmPresence(reaction, user, sendMessage);
      }

      if (actionAndMessage?.action === "confirm_finish_match_lol") {
        await confirmFinishMatch_lol(reaction, user, sendMessage);
      }

      if (actionAndMessage?.action === "embed_time1_lol") {
        await embedTime1_lol(reaction, user, sendMessage, actionAndMessage);
      }

      if (actionAndMessage?.action === "embed_time2_lol") {
        await embedTime2_lol(reaction, user, sendMessage, actionAndMessage);
      }

      // VALORANT FUNCTIONS

      if (actionAndMessage?.action === "maps_selection") {
        await valorantMapDraw(reaction, user, sendMessage);
      }

      if (actionAndMessage?.action === "embed_time1_valorant") {
        await embedTime1_valorant(
          reaction,
          user,
          sendMessage,
          actionAndMessage
        );
      }

      if (actionAndMessage?.action === "embed_time2_valorant") {
        await embedTime2_valorant(
          reaction,
          user,
          sendMessage,
          actionAndMessage
        );
      }

      if (actionAndMessage?.action === "valorant_confirm_presence") {
        await valorantConfirmPresence(reaction, user, sendMessage);
      }

      if (actionAndMessage?.action === "confirm_finish_match_valorant") {
        await confirmFinishMatch_valorant(reaction, user, sendMessage);
      }
    } catch (error) {
      emitSentry(
        "reactionFetchMessageAction",
        "Tried to fetch a reaction message and proceed with action",
        error
      );
      console.log(error);
    }
  }
}

let matchConfirmed = "";
async function leagueOfLegendsConfirmPresence(reaction, user, sendMessage) {
  const { MIN_REACTION_TO_CONFIRM_MATCH_LOL } = DISCORD_CONFIG.numbers;
  matchConfirmed = "";

  const category: CategoryChannel = sendMessage.channel.parent;
  const channelTeam1 = category.children.find(
    (channel) => channel.name === "Time 1"
  );
  const channelTeam2 = category.children.find(
    (channel) => channel.name === "Time 2"
  );
  const players = await fetchUsersFromCategory("queue_lol", category.id);
  const channel = await client.channels.cache.get(sendMessage.channelId);

  const timer = setTimeout(async () => {
    if (matchConfirmed === "") {
      cancelLobby_lol(players, sendMessage, timer, channel);
    } else {
      return;
    }
  }, 45000);

  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  if (reaction.emoji.name === "👍" && !user.bot) {
    if (reaction.count === Number(MIN_REACTION_TO_CONFIRM_MATCH_LOL)) {
      console.log("Partida confirmada");
      matchConfirmed = "true";
      await sendMessage.delete();

      await leagueOfLegendsManageUsersFunc(
        sendMessage,
        channelTeam1,
        channelTeam2
      );
    }
  }
}

let matchConfirmed_valorant = "";
async function valorantConfirmPresence(reaction, user, sendMessage) {
  const { MIN_REACTION_TO_CONFIRM_MATCH_VALORANT } = DISCORD_CONFIG.numbers;

  const channel = await client.channels.cache.get(sendMessage.channelId);
  if (channel.type !== "GUILD_TEXT") {
    return;
  }
  const category = channel.parentId;

  const players = await fetchUsersFromCategory("users_5v5", category);

  const timer = setTimeout(async () => {
    if (matchConfirmed_valorant === "") {
      cancelLobby_valorant(players, sendMessage, timer, channel);
    } else {
      return;
    }
  }, 45000);

  if (reaction.emoji.name === "👍" && !user.bot) {
    if (reaction.count === Number(MIN_REACTION_TO_CONFIRM_MATCH_VALORANT)) {
      console.log("Partida Confirmada");
      matchConfirmed_valorant = "true";
      await sendMessage.delete();

      // MAP SELECTION
      const mapa = await valorantMapsSelectionFunc();
      const selectedMap = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle("Mapa selecionado")
        .setDescription(
          ` Mapa Selecionado foi: **${mapa.name}** \n\n Reaja com 🔄 para selecionar outro mapa \n  Reaja com ✅ para confirmar o mapa \n\n **Em 40 segundos sera confirmado o ultimo mapa selecionado!**`
        )
        .setImage(mapa.minimap);

      const mapsMessage = await channel.send({
        embeds: [selectedMap],
      });

      console.log("Creating action_and_message maps_Selection");
      await createActionAndMessage(mapsMessage.id, "maps_selection")
        .then(() => console.log("created !!!"))
        .catch((e) => console.error(e));

      mapsMessage.react("🔄");
      mapsMessage.react("✅");

      const collector_map_draw = mapsMessage.createReactionCollector({
        time: 40000,
      });

      collector_map_draw.on("end", async (reaction, reason) => {
        if (reason === "time") {
          await valorantStartLobbyFunc(mapsMessage);
        }
      });
    }
  }
}

async function valorantMapDraw(reaction, user, sendMessage) {
  const newMap = await valorantMapsSelectionFunc();
  const channel = await client.channels.cache.get(sendMessage.channelId);

  if (channel.type !== "GUILD_TEXT") {
    return;
  }
  const {
    MIN_REACTION_TO_DRAW_MAP_AGAIN,
    MIN_REACTION_TO_CONFIRM_MAP_VALORANT,
  } = DISCORD_CONFIG.numbers;

  let map = newMap.name;

  if (reaction.emoji.name === "🔄" && !user.bot) {
    if (reaction.count === Number(MIN_REACTION_TO_DRAW_MAP_AGAIN)) {
      console.log("[Reactions] Map swap count work");
      const mapMessage = sendMessage;
      const selectedMap = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle("Mapa selecionado")
        .setDescription(
          ` Mapa Selecionado foi: **${newMap.name}** \n\n Reaja com 🔄 para selecionar outro mapa \n Reaja com ✅ para confirmar o mapa \n\n **Em 40 segundos sera confirmado o ultimo mapa selecionado!**`
        )
        .setImage(newMap.minimap);

      await mapMessage.edit({
        embeds: [selectedMap],
      });
      mapMessage.reactions.removeAll();
      mapMessage.react("🔄");
      mapMessage.react("✅");
    }
  } else if (reaction.emoji.name === "✅" && !user.bot) {
    if (reaction.count === Number(MIN_REACTION_TO_CONFIRM_MAP_VALORANT)) {
      await valorantStartLobbyFunc(sendMessage);
    }
  }
}

async function confirmFinishMatch(reaction, user, sendMessage) {
  let winnerTeam = "";

  const { MIN_REACTION_TO_VOTE_END_MATCH } = DISCORD_CONFIG.numbers;

  if (reaction.emoji.name === "1️⃣" && !user.bot) {
    if (reaction.count === MIN_REACTION_TO_VOTE_END_MATCH) {
      const messageTime1 = await sendMessage.channel.send({
        content: `<@&${role_aux_event}>`,
        embeds: [embedTime1],
      });

      await createActionAndMessage(
        messageTime1.id,
        "embed_time1",
        sendMessage.id
      );

      messageTime1.react("✅");
      messageTime1.react("🛑");
    }
  } else if (reaction.emoji.name === "2️⃣" && !user.bot) {
    if (reaction.count === MIN_REACTION_TO_VOTE_END_MATCH) {
      const messageTime2 = await sendMessage.channel.send({
        content: `<@&${role_aux_event}>`,
        embeds: [embedTime2],
      });

      await createActionAndMessage(
        messageTime2.id,
        "embed_time2",
        sendMessage.id
      );

      messageTime2.react("✅");
      messageTime2.react("🛑");
    }
  } else if (reaction.emoji.name === "❌" && !user.bot) {
    const member = await sendMessage.guild.members.fetch(user.id);
    console.log("cancel button is pressed!");

    if (member.permissions.has("MODERATE_MEMBERS")) {
      console.log(
        member.permissions.has("MODERATE_MEMBERS")
          ? "Tem o cargo"
          : "Não tem o cargo"
      );

      winnerTeam = "Partida Cancelada";

      try {
        const message = await sendMessage.channel.send({
          embeds: [PartidaCancelada],
        });
        console.log("passei do await");
        await endReactionConfirmMatch(sendMessage, winnerTeam);
      } catch (error) {
        emitSentry(
          "endReactionConfirmMatch",
          "Tried to send a message and cancel the match",
          error
        );
        console.log(error);
      }
    }
  }
}

async function confirmFinishMatch_lol(reaction, user, sendMessage) {
  let winnerTeam = "";

  const { MIN_REACTION_TO_END_MATCH_VALORANT } = DISCORD_CONFIG.numbers;

  if (reaction.emoji.name === "1️⃣" && !user.bot) {
    if (reaction.count === Number(MIN_REACTION_TO_END_MATCH_VALORANT)) {
      const messageTime1 = await sendMessage.channel.send({
        content: `<@&${role_aux_event}>`,
        embeds: [embedTime1],
      });

      await createActionAndMessage(
        messageTime1.id,
        "embed_time1_lol",
        sendMessage.id
      );

      messageTime1.react("✅");
      messageTime1.react("🛑");
    }
  } else if (reaction.emoji.name === "2️⃣" && !user.bot) {
    if (reaction.count === Number(MIN_REACTION_TO_END_MATCH_VALORANT)) {
      const messageTime2 = await sendMessage.channel.send({
        content: `<@&${role_aux_event}>`,
        embeds: [embedTime2],
      });

      await createActionAndMessage(
        messageTime2.id,
        "embed_time2_lol",
        sendMessage.id
      );

      messageTime2.react("✅");
      messageTime2.react("🛑");
    }
  } else if (reaction.emoji.name === "❌" && !user.bot) {
    const member = await sendMessage.guild.members.fetch(user.id);
    console.log("cancel button is pressed!");

    if (member.permissions.has("MODERATE_MEMBERS")) {
      await leagueOfLegendsFinishLobbyFunc(sendMessage, "Partida Cancelada");
    }
  }
}

async function confirmFinishMatch_valorant(reaction, user, sendMessage) {
  let winnerTeam = "";

  const { MIN_REACTION_TO_END_MATCH_VALORANT } = DISCORD_CONFIG.numbers;

  if (reaction.emoji.name === "1️⃣" && !user.bot) {
    if (reaction.count === Number(MIN_REACTION_TO_END_MATCH_VALORANT)) {
      try {
        await sendMessage.reactions.removeAll();
      } catch (error) {
        console.log(error);
      }
      const messageTime1 = await sendMessage.channel.send({
        content: `<@&${role_aux_event}>`,
        embeds: [embedTime1],
      });

      await createActionAndMessage(
        messageTime1.id,
        "embed_time1_valorant",
        sendMessage.id
      );

      messageTime1.react("✅");
      messageTime1.react("🛑");
    }
  } else if (reaction.emoji.name === "2️⃣" && !user.bot) {
    if (reaction.count === Number(MIN_REACTION_TO_END_MATCH_VALORANT)) {
      try {
        await sendMessage.reactions.removeAll();
      } catch (error) {
        console.log(error);
      }
      const messageTime2 = await sendMessage.channel.send({
        content: `<@&${role_aux_event}>`,
        embeds: [embedTime2],
      });

      await createActionAndMessage(
        messageTime2.id,
        "embed_time2_valorant",
        sendMessage.id
      );

      messageTime2.react("✅");
      messageTime2.react("🛑");
    }
  } else if (reaction.emoji.name === "❌" && !user.bot) {
    const member = await sendMessage.guild.members.fetch(user.id);

    if (member.permissions.has("MODERATE_MEMBERS")) {
      await valorantFinishMatchFunc(sendMessage, "Partida Cancelada");
    }
  }
}

async function embedTime1Func(reaction, user, sendMessage, actionAndMessage) {
  const member = await sendMessage.guild.members.fetch(user.id);
  const messageTime1 = sendMessage;
  let winnerTeam = "Time 1";

  if (
    reaction.emoji.name === "✅" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      await endReactionConfirmMatch(sendMessage, winnerTeam);
    } catch (error) {
      emitSentry(
        "time1ConfirmWinner",
        "Tried to confirm the team 1 as a winner",
        error
      );
      console.log(error);
    }
  } else if (
    reaction.emoji.name === "🛑" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      const channel = await client.channels.cache.get(messageTime1.channelId);

      if (channel.type !== "GUILD_TEXT") {
        return;
      }

      const fatherMessage = await channel.messages.fetch(actionAndMessage.data);
      await messageTime1.delete();
      await fatherMessage.reactions
        .removeAll()
        .catch((error) => console.log(error));
      await fatherMessage.react("1️⃣");
      await fatherMessage.react("2️⃣");
      await fatherMessage.react("❌");
    } catch (error) {
      emitSentry("time1CancelMatch", "Tried to cancel the match winner", error);
      console.log(error);
    }
  }
}

async function embedTime2Func(reaction, user, sendMessage, actionAndMessage) {
  const member = await sendMessage.guild.members.fetch(user.id);
  const messageTime2 = sendMessage;
  let winnerTeam = "Time 2";

  if (
    reaction.emoji.name === "✅" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      await endReactionConfirmMatch(sendMessage, winnerTeam);
    } catch (error) {
      emitSentry(
        "time2ConfirmWinner",
        "Tried to confirm the team 2 as a winner",
        error
      );
      console.log("error when stopping winner2 collector =", error);
    }
  } else if (
    reaction.emoji.name === "🛑" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      const channel = await client.channels.cache.get(messageTime2.channelId);

      if (channel.type !== "GUILD_TEXT") {
        return;
      }

      const fatherMessage = await channel.messages.fetch(actionAndMessage.data);
      await messageTime2.delete();
      await fatherMessage.reactions
        .removeAll()
        .catch((error) => console.log(error));
      await fatherMessage.react("1️⃣");
      await fatherMessage.react("2️⃣");
      await fatherMessage.react("❌");
    } catch (error) {
      emitSentry("time2CancelMatch", "Tried to cancel the match winner", error);
      console.log("error when deleting message for team2=", error);
    }
  }
}

async function endReactionConfirmMatch(sendMessage, winnerTeam) {
  const waiting_room_id = DISCORD_CONFIG.channels.waiting_room_id;
  const channel = await client.channels.cache.get(sendMessage.channelId);

  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  await updateFinishTime(channel.parentId);
  const players = await fetchUsersFromCategory("users_4v4", channel.parentId);
  updateMmrMatch(channel.parentId, winnerTeam);

  players.forEach(async (player) => {
    if (player.team === winnerTeam) {
      await updateResultUser(
        "lobbys",
        player.user_id,
        channel.parentId,
        "Venceu"
      );
    } else if (
      player.team !== winnerTeam &&
      winnerTeam !== "Partida Cancelada"
    ) {
      await updateResultUser(
        "lobbys",
        player.user_id,
        channel.parentId,
        "Perdeu"
      );
    } else if (winnerTeam === "Partida Cancelada") {
      await updateResultUser(
        "lobbys",
        player.user_id,
        channel.parentId,
        "Cancelado"
      );
    }
  });

  await removeusersFromChannel(
    "users_4v4",
    channel.parentId,
    waiting_room_id,
    sendMessage
  );
  await removeUsersFromCategory("users_4v4", channel.parentId);

  try {
    setTimeout(() => deleteCategory(sendMessage), 3000);
  } catch (error) {
    emitSentry("deleteCategory", "Tried to delete the category", error);
    console.log("error when deleting category=", error);
  }
}

async function endReactionConfirmMatch_lol(sendMessage, winnerTeam) {
  const waiting_room_id = DISCORD_CONFIG.channels.waiting_room_id;
  const channel = await client.channels.cache.get(sendMessage.channelId);

  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  const players = await fetchUsersFromCategory("queue_lol", channel.parentId);

  players.forEach(async (player) => {
    if (player.team === winnerTeam) {
      await updateResultUser(
        "lobbys_lol",
        player.user_id,
        channel.parentId,
        "Venceu"
      );
    } else if (
      player.team !== winnerTeam &&
      winnerTeam !== "Partida Cancelada"
    ) {
      await updateResultUser(
        "lobbys_lol",
        player.user_id,
        channel.parentId,
        "Perdeu"
      );
    } else if (winnerTeam === "Partida Cancelada") {
      await updateResultUser(
        "lobbys_lol",
        player.user_id,
        channel.parentId,
        "Cancelado"
      );
    }
  });

  await removeusersFromChannel(
    "queue_lol",
    channel.parentId,
    waiting_room_id,
    sendMessage
  );
  await removeUsersFromCategory("queue_lol", channel.parentId);

  try {
    setTimeout(() => deleteCategory(sendMessage), 3000);
  } catch (error) {
    console.log("error when deleting category=", error);
  }
}

async function endReactionConfirmMatch_valorant(sendMessage, winnerTeam) {
  const waiting_room_id = DISCORD_CONFIG.channels.waiting_room_id;

  const channel = await client.channels.cache.get(sendMessage.channelId);

  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  await updateFinishTime(channel.parentId);
  const players = await fetchUsersFromCategory("users_5v5", channel.parentId);

  for (const player of players) {
    if (player.team === winnerTeam) {
      await updateResultUser(
        "lobbys_valorant",
        player.user_id,
        channel.parentId,
        "Venceu"
      );
    } else if (
      player.team !== winnerTeam &&
      winnerTeam !== "Partida Cancelada"
    ) {
      await updateResultUser(
        "lobbys_valorant",
        player.user_id,
        channel.parentId,
        "Perdeu"
      );
    } else if (winnerTeam === "Partida Cancelada") {
      await updateResultUser(
        "lobbys_valorant",
        player.user_id,
        channel.parentId,
        "Cancelado"
      );
    }
  }
  await removeusersFromChannel(
    "users_5v5",
    channel.parentId,
    waiting_room_id,
    sendMessage
  ),
    setTimeout(
      async () => removeUsersFromCategory("users_5v5", channel.parentId),
      5000
    );
  try {
    setTimeout(() => deleteCategory(sendMessage), 5000);
  } catch (error) {
    console.log("error when deleting category=", error);
  }
}

async function embedTime1_lol(reaction, user, sendMessage, actionAndMessage) {
  const member = await sendMessage.guild.members.fetch(user.id);
  const messageTime1 = sendMessage;
  let winnerTeam = "Time 1";

  if (
    reaction.emoji.name === "✅" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    console.log("ENTREI AQUI");
    try {
      await endReactionConfirmMatch_lol(sendMessage, winnerTeam);
    } catch (error) {
      console.log(error);
    }
  } else if (
    reaction.emoji.name === "🛑" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      const channel = await client.channels.cache.get(messageTime1.channelId);

      if (channel.type !== "GUILD_TEXT") {
        return;
      }

      const fatherMessage = await channel.messages.fetch(actionAndMessage.data);
      await messageTime1.delete();
      await fatherMessage.reactions
        .removeAll()
        .catch((error) => console.log(error));
      await fatherMessage.react("1️⃣");
      await fatherMessage.react("2️⃣");
      await fatherMessage.react("❌");
    } catch (error) {
      console.log(error);
    }
  }
}

async function embedTime2_lol(reaction, user, sendMessage, actionAndMessage) {
  const member = await sendMessage.guild.members.fetch(user.id);
  const messageTime2 = sendMessage;
  let winnerTeam = "Time 2";

  if (
    reaction.emoji.name === "✅" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    console.log("ENTREI AQUI");
    try {
      await endReactionConfirmMatch_lol(sendMessage, winnerTeam);
    } catch (error) {
      console.log("error when stopping winenr2 collector =", error);
    }
  } else if (
    reaction.emoji.name === "🛑" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      const channel = await client.channels.cache.get(messageTime2.channelId);

      if (channel.type !== "GUILD_TEXT") {
        return;
      }

      const fatherMessage = await channel.messages.fetch(actionAndMessage.data);
      await messageTime2.delete();
      await fatherMessage.reactions
        .removeAll()
        .catch((error) => console.log(error));
      await fatherMessage.react("1️⃣");
      await fatherMessage.react("2️⃣");
      await fatherMessage.react("❌");
    } catch (error) {
      console.log("error when deleting message for team2=", error);
    }
  }
}

async function embedTime1_valorant(
  reaction,
  user,
  sendMessage,
  actionAndMessage
) {
  const member = await sendMessage.guild.members.fetch(user.id);
  const messageTime1 = sendMessage;
  let winnerTeam = "Time 1";

  if (
    reaction.emoji.name === "✅" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      await endReactionConfirmMatch_valorant(sendMessage, winnerTeam);
    } catch (error) {
      console.log(error);
    }
  } else if (
    reaction.emoji.name === "🛑" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      const channel = await client.channels.cache.get(messageTime1.channelId);

      if (channel.type !== "GUILD_TEXT") {
        return;
      }

      const fatherMessage = await channel.messages.fetch(actionAndMessage.data);
      await messageTime1.delete();
      await fatherMessage.reactions
        .removeAll()
        .catch((error) => console.log(error));
      await fatherMessage.react("1️⃣");
      await fatherMessage.react("2️⃣");
      await fatherMessage.react("❌");
    } catch (error) {
      console.log(error);
    }
  }
}

async function embedTime2_valorant(
  reaction,
  user,
  sendMessage,
  actionAndMessage
) {
  const member = await sendMessage.guild.members.fetch(user.id);
  const messageTime2 = sendMessage;
  let winnerTeam = "Time 2";

  if (
    reaction.emoji.name === "✅" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      await endReactionConfirmMatch_valorant(sendMessage, winnerTeam);
    } catch (error) {
      console.log("error when stopping winenr2 collector =", error);
    }
  } else if (
    reaction.emoji.name === "🛑" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      const channel = await client.channels.cache.get(messageTime2.channelId);

      if (channel.type !== "GUILD_TEXT") {
        return;
      }

      const fatherMessage = await channel.messages.fetch(actionAndMessage.data);
      await messageTime2.delete();
      await fatherMessage.reactions
        .removeAll()
        .catch((error) => console.log(error));
      await fatherMessage.react("1️⃣");
      await fatherMessage.react("2️⃣");
      await fatherMessage.react("❌");
    } catch (error) {
      console.log("error when deleting message for team2=", error);
    }
  }
}

async function updateMmrMatch(channel_id, winner) {
  const players = await fetchUsersFromCategory("users_mmr", channel_id);

  players.forEach(async (player) => {
    // TODO: o jogo está fixo como free-fire, tem de identificar o jogo quando a parte de multijogos estiver pronta
    await updatePontuation(
      player.user_id,
      GAME_LIST.FREE_FIRE,
      1,
      winner === player.team ? "win" : "lose"
    );
  });
}

export async function cancelLobby_lol(players, sendMessage, timer, channel) {
  console.log("Lobby Cancelado");

  try {
    await channel.send({
      embeds: [PartidaCancelada],
    });
    for (const player of players) {
      Promise.all([
        updateCategory("queue_lol", player.user_id, ""),
        updateUserTeam("queue_lol", player.user_id, ""),
        updateInMatch("queue_lol", player.user_id, false),
        updateUserCaptain("queue_lol", player.user_id, ""),
      ]);
    }
    await dodgeQueueUsersManage(
      "queue_lol",
      sendMessage,
      players.map((player) => player.user_id)
    );

    clearTimeout(timer);
    matchConfirmed = "false";

    await leagueOfLegendsFinishLobbyFunc(sendMessage, "Partida Cancelada");
  } catch (error) {
    console.log(error);
  }
}

export async function cancelLobby_valorant(
  players,
  sendMessage,
  timer,
  channel
) {
  console.log("Lobby Cancelado");

  try {
    await channel.send({
      embeds: [PartidaCancelada],
    });
    for (const player of players) {
      Promise.all([
        updateCategory("users_5v5", player.user_id, ""),
        updateUserTeam("users_5v5", player.user_id, ""),
        updateInMatch("users_5v5", player.user_id, false),
        updateUserCaptain("users_5v5", player.user_id, ""),
      ]);
    }
    await dodgeQueueUsersManage(
      "users_5v5",
      sendMessage,
      players.map((player) => player.user_id)
    );

    clearTimeout(timer);
    matchConfirmed_valorant = "false";

    await valorantFinishMatchFunc(sendMessage, "Partida Cancelada");
  } catch (error) {
    console.log(error);
  }
}
