import { Command } from "../../structures/Command";
import {
  ButtonInteraction,
  CategoryChannel,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
  TextChannel,
} from "discord.js";
import {
  verifyUserState,
  verifyUserExist,
  removeUser,
  createUser5v5_lol,
  checkUserRolelol,
  registerUserOnPlayerslol,
  updateInMatch,
  updateUserTeam,
  createActionAndMessage,
  updateCategory,
} from "../../utils/db";
import { embedPermission } from "../../utils/embeds";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { generateTeam5v5_lol } from "../../utils/5v5/generateTeam5v5";
import { createChannels } from "../../utils/5v5/manageUsers";
import {
  confirm_message,
  StartLobby,
} from "../../utils/4v4/messageInteractionsTemplates";
import {
  buttonCallMod_lol,
  buttonConfirmFinishMatch_lol,
  buttonFinishMatchDisabled_lol,
  FinishLobby,
  PreFinishLobby,
} from "../../utils/5v5/messageInteractionsTemplates";

const { channels, roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;
const role_event = roles.event;
const role_moderator = roles.moderator;
const role_admin = roles.admin;

const StartQueue = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle(
    "Sejam bem vindos as salas premiadas de League of Legends da SNACKCLUB!"
  )
  .setDescription(
    "Para entrar na fila, aperte o botão abaixo e aguarde na chamada de voz"
  );

const BUTTONS = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("enter_queue_lol")
    .setEmoji("🎮")
    .setLabel("Entrar na Fila")
    .setStyle("SUCCESS"),
  new MessageButton()
    .setCustomId("leave_queue_lol")
    .setEmoji("❌")
    .setLabel("Sair da Fila")
    .setStyle("DANGER")
);

const row = new MessageActionRow().addComponents(
  new MessageSelectMenu()
    .setCustomId("roles_lol")
    .setPlaceholder("Selecione as posições")
    .setMinValues(2)
    .setMaxValues(2)
    .addOptions([
      {
        label: "TOP",
        value: "Top-laner",
      },
      {
        label: "MID",
        value: "Mid-laner",
      },
      {
        label: "SUPPORT",
        value: "Support",
      },
      {
        label: "AD CARRY",
        value: "AD Carry",
      },
      {
        label: "JUNGLE",
        value: "Jungler",
      },
    ])
);

export async function handleSelectMenuInteraction(
  btnInt: SelectMenuInteraction
) {
  const log = (...message: any[]) => {
    console.log(`${btnInt.user.username} --`, ...message);
  };

  try {
    await btnInt.deferUpdate();

    const role1 = btnInt.values[0];
    const role2 = btnInt.values[1];

    btnInt.editReply({
      content: `🎇 PROCURANDO PARTIDA...🎇 \n\n Role Principal: **${role1.toUpperCase()}** \n Role Secundária: **${role2.toUpperCase()}**`,
      components: [],
    });

    const player = await checkUserRolelol(btnInt.user.id);

    if (player.length === 0) {
      await registerUserOnPlayerslol(
        btnInt.user.id,
        role1,
        btnInt.user.username
      );
    }

    await createUser5v5_lol(
      btnInt.user.id,
      btnInt.user.tag,
      role1,
      role2,
      btnInt.guildId
    );
  } catch (error) {
    log(error);
  }
}

export async function handleButtonInteractionQueue_lol(
  btnInt: ButtonInteraction
) {
  const log = (...message: any[]) => {
    console.log(`[${btnInt.user.username}] --`, ...message);
  };

  try {
    await btnInt.deferReply({
      ephemeral: true,
      fetchReply: false,
    });

    log("Iniciando ação do botão", btnInt.customId);
    const player = await verifyUserState("queue_lol", btnInt.user.id, false);
    const userExist = await verifyUserExist("queue_lol", btnInt.user.id);
    log("Requests feitos");

    const isInQueue = userExist.length !== 0 || player.length !== 0;

    log("Is in queue=", isInQueue);

    switch (btnInt.customId) {
      case "enter_queue_lol":
        if (isInQueue) {
          log("User already in queue");

          await btnInt.editReply({
            content: " ❌ VOCÊ JA ESTÁ PARTICIPANDO ❌",
            components: [],
          });
          return;
        }

        log("adding user to queue");
        await btnInt.editReply({
          content: "Escolha 2 posições",
          components: [row],
        });

        log("user added to queue.");
        log("message replied.");
        break;

      case "leave_queue_lol":
        if (!isInQueue || player.length !== 1) {
          log("User not in queue");

          await btnInt.editReply({
            content: " ❌ VOCÊ NÃO ESTÁ NA FILA ❌",
            components: [],
          });
          return;
        }
        log("removing user from queue");
        await removeUser("queue_lol", btnInt.user.id);
        log("user removed from queue");
        await btnInt.editReply({
          content: "❌ VOCÊ SAIU DA FILA ❌",
          components: [],
        });
        log("message replied.");
        break;
    }
  } catch (error) {
    log("Error!", error);

    await btnInt.editReply({
      content: "⚠️ Encontramos um error, tente novamente.",
      components: [],
    });
  }
}

export default new Command({
  name: "lol_queue",
  description: "Entra na fila para jogar Valorant",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    if (
      !interaction.memberPermissions.has("ADMINISTRATOR") &&
      interaction.user.id !== DISCORD_CONFIG.mockAdminId
    ) {
      interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }

    await interaction.deleteReply();

    const channel = interaction.guild.channels.cache.get(
      channels.queue_room_id
    ) as TextChannel;

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: "BUTTON",
    });

    collector.on("end", (collected) => {
      console.log(`Ended collecting ${collected.size} items`);
    });

    const message = await channel.send({
      embeds: [StartQueue],
      components: [BUTTONS],
    });

    const channelAnnouncement = interaction.guild.channels.cache.get(
      interaction.channel.id
    );
    if (channelAnnouncement.type !== "GUILD_TEXT") {
      return;
    }

    await searchMatch(interaction, interaction.guildId, channelAnnouncement);
  },
});

async function searchMatch(
  interaction,
  guild_id: string,
  channel: TextChannel
) {
  const players = await generateTeam5v5_lol(guild_id);

  if (players === undefined) {
    console.log("Procurando...");
    setTimeout(() => searchMatch(interaction, guild_id, channel), 8000);
  }

  if (players !== undefined) {
    const channels = await createChannels(
      interaction,
      players.time1,
      players.time2
    );

    const annoucements: TextChannel = channels?.textChatAnnouncements;
    const category: CategoryChannel = channels?.category;

    try {
      for (const player of players.time1) {
        Promise.all([
          updateUserTeam("queue_lol", player.user_id, "Time 1"),
          updateInMatch("queue_lol", player.user_id, true),
          updateCategory("queue_lol", player.user_id, category.id),
        ]);
      }
      for (const player of players.time2) {
        Promise.all([
          updateUserTeam("queue_lol", player.user_id, "Time 2"),
          updateInMatch("queue_lol", player.user_id, true),
          updateCategory("queue_lol", player.user_id, category.id),
        ]);
      }

      const StartLobby = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle("Lobby Iniciado")
        .setDescription(
          `Time 1: \n ${players.time1
            .map((player) => `<@${player.user_id}> : ${player.role}`)
            .join("\n")} \n\n Time 2: \n ${players.time2
            .map((player) => `<@${player.user_id}> : ${player.role}`)
            .join("\n")}`
        );
      await annoucements.send({
        embeds: [StartLobby],
      });

      const message_confirm = await annoucements.send({
        embeds: [confirm_message],
      });

      message_confirm.react("👍");

      await createActionAndMessage(message_confirm.id, "lol_confirm_presence");
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => searchMatch(interaction, guild_id, channel), 8000);
    return players;
  }
}

export async function handleButtonInteractionPlayerMenu_lol(
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
      case "call_mod_lol":
        log("Iniciando ação do botão", btnInt.customId);

        await btnInt.deleteReply();

        await btnInt.channel.send({
          content: `<@&${role_aux_event}>`,
          embeds: [EMBEDCALLMOD],
        });

        break;

      case "finish_match_lol":
        log("Iniciando ação do botão", btnInt.customId);

        const channelLobby = await btnInt.channel.fetch();

        await channelLobby.messages.edit(btnInt.message.id, {
          embeds: [StartLobby],
          components: [buttonCallMod_lol, buttonFinishMatchDisabled_lol],
        });

        const sendMessageFinish = await btnInt.channel.send({
          embeds: [PreFinishLobby],
          components: [buttonConfirmFinishMatch_lol],
        });

        await btnInt.deleteReply(); // delete thinking message

        break;

      case "confirm_finish_match_lol":
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
    log("Error!", error);
    await btnInt.editReply({
      content: "⚠️ Encontramos um error, tente novamente.",
      components: [],
    });
  }
}