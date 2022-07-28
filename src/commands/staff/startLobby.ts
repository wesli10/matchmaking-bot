import { Command } from "../../structures/Command";
import {
  MessageEmbed,
  ButtonInteraction,
  Message,
  OverwriteResolvable,
  CacheType,
  MessageInteraction,
  ReactionManager,
} from "discord.js";
import { embedPermission } from "../../utils/embeds";
import {
  create4v4Lobby,
  createActionAndMessage,
  fetchCategory,
  fetchUsersFromCategory,
  getActionAndMessage,
  createEndedMatch,
  getEndedMatch,
  removeUsersFromCategory,
  updateCategory,
  updateFinishTime,
  updateInMatch,
  updateModerator,
  updateResultUser,
  updateUserTeam,
  updateWinnerAndFinishTime,
  hasCalledMod,
  insertCallMod,
  deleteCallsMod,
} from "../../utils/db";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { generateTeam4v4 } from "../../utils/4v4/generateTeam4v4";
import { removeusersFromChannel } from "../../utils/4v4/manageUsers";
import {
  buttonCallMod,
  buttonConfirmFinishMatch,
  buttonFinishMatch,
  buttonFinishMatchDisabled,
  confirm_message,
  embedTime1,
  embedTime2,
  FinishedMatch,
  FinishLobby,
  PartidaCancelada,
  PreFinishLobby,
  StartLobby,
} from "../../utils/4v4/messageInteractionsTemplates";
import { client, emitSentry } from "../..";
import { getPermissions } from "../../configs/permissions.config";

const { roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;
const role_event = roles.event;
const role_moderator = roles.moderator;
const role_admin = roles.admin;

export default new Command({
  name: "4v4",
  description: "start 4v4 match with player in queue",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      !admin.includes(role_aux_event) &&
      !admin.includes(role_event) &&
      !admin.includes(role_moderator) &&
      !admin.includes(role_admin)
    ) {
      interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }

    const players = await generateTeam4v4(interaction.guildId);

    if (
      players.length < DISCORD_CONFIG.numbers.MIN_NUM_PLAYERS_TO_START_LOBBY
    ) {
      await interaction.editReply({
        content: "❌ Não há jogadores suficientes na fila.",
      });
      setTimeout(() => interaction.deleteReply(), 3000);
      return;
    }

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

    // Voice chat
    const gameChannel = await interaction.guild.channels.create(
      `VOICE - ${interaction.user.username} [${Math.floor(
        Math.random() * 999
      )}]`,
      {
        type: "GUILD_VOICE",
        parent: category.id,
        permissionOverwrites: permissions,
      }
    );

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

    const message_confirm = await textChatAnnouncements.send({
      embeds: [confirm_message],
    });

    message_confirm.react("👍");

    const confirm_collector = message_confirm.createReactionCollector({
      time: 10000,
    });

    confirm_collector.on("collect", async (reaction, user) => {
      if (reaction.emoji.name === "👍" && !user.bot) {
        if (
          reaction.count ===
          Number(DISCORD_CONFIG.numbers.MIN_REACTION_TO_CONFIRM_MATCH)
        ) {
          for (const player of players) {
            const member = await interaction.guild.members.fetch(
              player.user_id
            );
            const playerTeam = player.team === 1 ? "Time 1" : "Time 2";
            await Promise.all([
              updateInMatch("users_4v4", player.user_id, true),
              create4v4Lobby(
                player.user_id,
                category.id,
                interaction.user.id,
                playerTeam
              ),
              updateUserTeam(
                "users_4v4",
                player.user_id,
                player.team === 1 ? "Time 1" : "Time 2"
              ),
              updateCategory("users_4v4", player.user_id, category.id),
              updateModerator("users_4v4", player.user_id, interaction.user.id),
              member.voice
                .setChannel(gameChannel.id)
                .catch((error) => console.log(error)),
            ]);
          }
          await message_confirm.delete();
          await textChatAnnouncements.send({
            embeds: [StartLobby],
            components: [buttonCallMod, buttonFinishMatch],
          });
        }
      }
    });

    confirm_collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        const channel = await interaction.channel.fetch();
        if (channel.type !== "GUILD_TEXT") {
          return;
        }
        await textChatAnnouncements.send({
          embeds: [PartidaCancelada],
        });

        setTimeout(() => deleteCategory(message_confirm), 3000);
      }
    });

    const collectorButton = interaction.channel.createMessageComponentCollector(
      {
        componentType: "BUTTON",
      }
    );

    collectorButton.on("end", (collectedButton) => {
      console.log(`Ended Collecting ${collectedButton.size} items`);
    });

    await interaction.deleteReply();
  },
});

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

export async function handleButtonInteractionPlayerMenu(
  btnInt: ButtonInteraction
) {
  const log = (...message: any[]) => {
    console.log(`[${btnInt.user.username}] --`, ...message);
  };

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
      case "call_mod":
        log("Iniciando ação do botão", btnInt.customId);

        await deleteCallsMod();

        const hasCalled = await hasCalledMod(btnInt.channelId);
        if (hasCalled) {
          log("Já chamou o mod");

          await btnInt.editReply({
            content:
              "❌ Essa partida já chamou o mod, aguarde 2 minutos para chamar novamente!",
          });
          setTimeout(() => btnInt.deleteReply(), 3000);
          break;
        }

        await insertCallMod(btnInt.channelId);

        await btnInt.deleteReply(); // delete thinking message

        await btnInt.channel.send({
          content: `<@&${role_aux_event}>`,
          embeds: [EMBEDCALLMOD],
        });

        break;

      case "finish_match":
        log("Iniciando ação do botão", btnInt.customId);

        if (global.raceStartLobby === true) {
          await sleep(3000);
        }

        global.raceStartLobby = true;

        const channelLobby = await btnInt.channel.fetch();

        const channelCategory = await client.channels.cache.get(
          btnInt.channelId
        );
        const endedMatch = await getEndedMatch(channelCategory.id);

        if (endedMatch) {
          await btnInt.deleteReply(); // delete thinking message

          break;
        }

        await createEndedMatch(channelCategory.id);

        await channelLobby.messages.edit(btnInt.message.id, {
          embeds: [StartLobby],
          components: [buttonCallMod, buttonFinishMatchDisabled],
        });

        const sendMessageFinish = await btnInt.channel.send({
          embeds: [PreFinishLobby],
          components: [buttonConfirmFinishMatch],
        });

        await btnInt.deleteReply(); // delete thinking message

        setTimeout(() => {
          global.raceStartLobby = true;
        }, 5000);

        break;

      case "confirm_finish_match":
        log("Iniciando ação do botão", btnInt.customId);

        const channel = await btnInt.channel.fetch();

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
    log("Error!", error);
    emitSentry(
      "buttonInteractionMatch",
      "Tried to use button call_mod/finish_match",
      error
    );

    await btnInt.editReply({
      content: "⚠️ Encontramos um error, tente novamente.",
      components: [],
    });
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
