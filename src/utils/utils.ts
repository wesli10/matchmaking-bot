import { TextChannel } from "discord.js";
import { client } from "..";
import { DISCORD_CONFIG } from "../configs/discord.config";
import { confirm_message } from "./4v4/messageInteractionsTemplates";
import {
  dodgeQueueUsersManage,
  leagueOfLegendsFinishLobbyFunc,
} from "./5v5/manageUsers";
import {
  createActionAndMessage,
  updateCategory,
  updateInMatch,
  updateUserTeam,
} from "./db";

export async function confirm_participateFunc(textChatAnnouncements) {
  const channel = textChatAnnouncements;
  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  const message_confirm = await channel.send({
    embeds: [confirm_message],
  });

  message_confirm.react("👍");

  await createActionAndMessage(message_confirm.id, "confirm_presence");
}

export async function clearMessages() {
  const channel = await client.channels.fetch(
    DISCORD_CONFIG.channels.queue_room_id
  );
  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  channel.bulkDelete(99);

  console.log("Queues Cleaned!");
}
