import { client } from "../index";
import { DISCORD_CONFIG } from "../configs/discord.config";
import {
  createActionAndMessage,
  fetchUsersFromCategory,
  getActionAndMessage,
  removeUsersFromCategory,
  updateFinishTime,
  updateResultUser,
} from "./db";
import { MessageReaction } from "discord.js";
import {
  embedTime1,
  embedTime2,
  PartidaCancelada,
} from "./4v4/messageInteractionsTemplates";
import { removeusersFromChannel } from "./4v4/manageUsers";
import { deleteCategory } from "../commands/staff/startLobby";

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
    actionAndMessage?.action !== "embed_time2"
  ) {
    return;
  }

  if (!reaction.message?.channelId) {
    return;
  }

  const channelExists = client.channels.fetch(reaction.message?.channelId);

  if (!channelExists) {
    return;
  }

  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  if (reaction instanceof MessageReaction) {
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
        console.log(error);
      }
    }
  }
}

async function embedTime1Func(reaction, user, sendMessage, actionAndMessage) {
  const member = await sendMessage.guild.members.fetch(user.id);
  const messageTime1 = await reaction.message.fetch();
  let winnerTeam = "Time 1";

  if (
    reaction.emoji.name === "✅" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      await endReactionConfirmMatch(sendMessage, winnerTeam);
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

async function embedTime2Func(reaction, user, sendMessage, actionAndMessage) {
  const member = await sendMessage.guild.members.fetch(user.id);
  const messageTime2 = await reaction.message.fetch();
  let winnerTeam = "Time 2";

  if (
    reaction.emoji.name === "✅" &&
    !user.bot &&
    member.permissions.has("MODERATE_MEMBERS")
  ) {
    try {
      await endReactionConfirmMatch(sendMessage, winnerTeam);
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

async function endReactionConfirmMatch(sendMessage, winnerTeam) {
  const waiting_room_id = DISCORD_CONFIG.channels.waiting_room_id;
  const channel = await client.channels.cache.get(sendMessage.channelId);

  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  await updateFinishTime(channel.parentId);
  const players = await fetchUsersFromCategory(channel.parentId);

  players.forEach(async (player) => {
    if (player.team === winnerTeam) {
      await updateResultUser(player.user_id, channel.parentId, "Venceu");
    } else if (
      player.team !== winnerTeam &&
      winnerTeam !== "Partida Cancelada"
    ) {
      await updateResultUser(player.user_id, channel.parentId, "Perdeu");
    } else if (winnerTeam === "Partida Cancelada") {
      await updateResultUser(player.user_id, channel.parentId, "Cancelado");
    }
  });

  await removeusersFromChannel(channel.parentId, waiting_room_id, sendMessage);
  await removeUsersFromCategory(channel.parentId);

  try {
    setTimeout(() => deleteCategory(sendMessage), 3000);
  } catch (error) {
    console.log("error when deleting category=", error);
  }
}
