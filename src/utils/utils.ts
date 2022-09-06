import { ButtonInteraction, CacheType, Message, TextChannel } from "discord.js";
import { client, emitSentry } from "..";
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

export async function deleteCategory(
  interaction: ButtonInteraction<CacheType> | Message
) {
  const channelId = interaction.channelId;
  const channel = await client.channels.fetch(channelId);

  try {
    if (channel.type !== "GUILD_TEXT") {
      throw new Error("Channel is not a text channel");
    }

    const parentCategory = await channel.parent;

    if (!parentCategory) {
      throw new Error("Channel has no parent");
    }

    await Promise.all(
      parentCategory.children.map((channel) => channel.delete())
    );
    parentCategory.delete();
  } catch (error) {
    console.log(error);
    emitSentry(
      "deleteCategory",
      "Tried to press queue button interaction to enter/leave queue",
      error
    );
    await interaction.channel.send({
      content: "Ocorreu um erro ao deletar a categoria, Tente novamente!",
    });

    if (interaction instanceof ButtonInteraction) {
      setTimeout(async () => await interaction.deleteReply(), 3000);
    } else {
      interaction.delete();
    }
  }
}
