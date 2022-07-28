import {
  ButtonInteraction,
  MessageEmbed,
  OverwriteResolvable,
} from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { getPermissions } from "../../configs/permissions.config";
import { Command } from "../../structures/Command";
import { StartLobby } from "../../utils/4v4/messageInteractionsTemplates";
import { generateTeam5v5 } from "../../utils/5v5/generateTeam5v5";
import {
  buttonCallMod_valorant,
  buttonConfirmFinishMatch_valorant,
  buttonFinishMatchDisabled_valorant,
  FinishLobby,
  PreFinishLobby,
} from "../../utils/5v5/messageInteractionsTemplates";

import {
  createActionAndMessage,
  updateCategory,
  updateInMatch,
  updateModerator,
  updateUserTeam,
} from "../../utils/db";
import { confirm_participateFunc } from "../../utils/utils";

export default new Command({
  name: "valorant",
  description: "Generate a 5v5 lobby on valorant",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const players = await generateTeam5v5(interaction.guildId);
    if (players.length < DISCORD_CONFIG.numbers.MIN_NUM_PLAYERS_TO_5v5_MATCH) {
      await interaction.editReply({
        content: "❌ Não há jogadores suficientes na fila.",
      });
      setTimeout(() => interaction.deleteReply(), 3000);
      return;
    }

    await interaction.deleteReply(); // delete the thinking messag

    const permissions: OverwriteResolvable[] = [
      ...getPermissions(interaction),
      // Add players permissions as well
      ...players.map((player) => {
        return {
          id: player.user_id,
          allow: ["VIEW_CHANNEL"],
          deny: ["SPEAK"],
        };
      }),
    ];

    const permissionsTeam1: OverwriteResolvable[] = [
      ...getPermissions(interaction),
      // Add players permissions as well
      ...players
        .filter((player) => player.team === 1)
        .map((player) => {
          return {
            id: player.user_id,
            allow: ["VIEW_CHANNEL"],
            deny: ["SPEAK"],
          };
        }),
    ];

    const permissionsTeam2: OverwriteResolvable[] = [
      ...getPermissions(interaction),
      // Add players permissions as well
      ...players
        .filter((player) => player.team === 2)
        .map((player) => {
          return {
            id: player.user_id,
            allow: ["VIEW_CHANNEL"],
            deny: ["SPEAK"],
          };
        }),
    ];

    const permissionsAnnouncements: OverwriteResolvable[] = [
      ...getPermissions(interaction),
      // Add players permissions as well
      ...players.map((player) => {
        return {
          id: player.user_id,
          allow: ["VIEW_CHANNEL"],
          deny: ["SEND_MESSAGES"],
        };
      }),
    ];

    // Create category
    const category = await interaction.guild.channels.create(
      `${interaction.user.username}`,
      {
        type: "GUILD_CATEGORY",
        permissionOverwrites: permissions,
      }
    );

    // Create Text Chat
    const textChatAnnouncements = await interaction.guild.channels.create(
      "Informação",
      {
        type: "GUILD_TEXT",
        parent: category.id,
        permissionOverwrites: permissionsAnnouncements,
      }
    );

    // Create Voice Channel Team 1
    await interaction.guild.channels.create("Time 1", {
      type: "GUILD_VOICE",
      parent: category.id,
      permissionOverwrites: permissionsTeam1,
    });

    // Create Voice Channel Team 2
    await interaction.guild.channels.create("Time 2", {
      type: "GUILD_VOICE",
      parent: category.id,
      permissionOverwrites: permissionsTeam2,
    });

    for (const player of players) {
      Promise.all([
        await updateInMatch("users_5v5", player.user_id, true),
        await updateCategory("users_5v5", player.user_id, category.id),
        await updateUserTeam(
          "users_5v5",
          player.user_id,
          player.team === 1 ? "Time 1" : "Time 2"
        ),
        await updateModerator("users_5v5", player.user_id, interaction.user.id),
      ]);
    }

    await textChatAnnouncements.send({
      content: `Time 1: <@${players
        .filter((player) => player.team === 1)
        .map((player) => player.user_id)
        .join(">, <@")}>`,
    });
    await textChatAnnouncements.send({
      content: `Time 2: <@${players
        .filter((player) => player.team === 2)
        .map((player) => player.user_id)
        .join(">, <@")}>`,
    });

    await confirm_participateFunc(textChatAnnouncements);
  },
});

export async function handleButtonInteractionPlayerMenu_valorant(
  btnInt: ButtonInteraction
) {
  const log = (...message: any[]) => {
    console.log(`[${btnInt.user.username}] --`, ...message);
  };
  const { roles } = DISCORD_CONFIG;

  const role_aux_event = roles.aux_event;

  const EMBEDCALLMOD = new MessageEmbed()
    .setColor("#fd4a5f")
    .setTitle("Chamando Mod")
    .setDescription(
      `⚠️ - Um <@&${role_aux_event}> foi notificado e está a caminho.\n\n jogador que fez o chamado: ${btnInt.user.tag}`
    );

  try {
    await btnInt.deferReply({
      ephemeral: false,
      fetchReply: false,
    });

    switch (btnInt.customId) {
      case "call_mod_valorant":
        log("Iniciando ação do botão", btnInt.customId);

        await btnInt.deleteReply(); // delete thinking message

        await btnInt.channel.send({
          content: `<@${role_aux_event}>`,
          embeds: [EMBEDCALLMOD],
        });

        break;

      case "finish_match_valorant":
        log("Iniciando ação do botão", btnInt.customId);

        const channelLobby = await btnInt.channel.fetch();

        await channelLobby.messages.edit(btnInt.message.id, {
          embeds: [StartLobby],
          components: [
            buttonCallMod_valorant,
            buttonFinishMatchDisabled_valorant,
          ],
        });

        const sendMessageFinish = await btnInt.channel.send({
          embeds: [PreFinishLobby],
          components: [buttonConfirmFinishMatch_valorant],
        });

        await btnInt.deleteReply(); // delete thinking message

        break;

      case "confirm_finish_match_valorant":
        log("Iniciando ação do botão", btnInt.customId);

        const channel = await btnInt.channel.fetch();
        if (channel.type !== "GUILD_TEXT") {
          return;
        }

        await channel.messages.delete(btnInt.message.id);

        await btnInt.deleteReply(); // delete thinking message

        // display menu

        const sendMessage = await btnInt.channel.send({
          embeds: [FinishLobby],
        });

        await createActionAndMessage(sendMessage.id, btnInt.customId);

        await sendMessage.react("1️⃣");
        await sendMessage.react("2️⃣");
        await sendMessage.react("❌");

        break;
    }
  } catch (error) {
    console.log(error);
  }
}
