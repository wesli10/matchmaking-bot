import { Command } from "../../structures/Command";
import {
  ButtonInteraction,
  CategoryChannel,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  ReactionCollector,
  TextChannel,
} from "discord.js";
import {
  verifyUserState,
  verifyUserExist,
  removeUser,
  createUser4v4,
  createUser5v5,
  updateInMatch,
  updateCategory,
  createActionAndMessage,
  updateUserTeam,
  fetchCapitainValorant,
} from "../../utils/db";
import { embedPermission } from "../../utils/embeds";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { generateTeam5v5 } from "../../utils/5v5/generateTeam5v5";
import {
  createChannels,
  valorantCaptainChoose,
} from "../../utils/5v5/manageUsers";
import {
  confirm_message,
  PreFinishLobby,
  StartLobby,
} from "../../utils/4v4/messageInteractionsTemplates";
import {
  buttonCallMod_valorant,
  buttonConfirmFinishMatch_valorant,
  buttonFinishMatchDisabled_valorant,
  FinishLobby,
} from "../../utils/5v5/messageInteractionsTemplates";
import { client } from "../..";

const { channels } = DISCORD_CONFIG;

const StartQueue = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Sejam bem vindos as salas premiadas de Valorant da SNACKCLUB!")
  .setDescription(
    "Para entrar na fila, aperte o botão abaixo e aguarde na chamada de voz"
  );

const BUTTONS = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("enter_queue_valorant")
    .setEmoji("🎮")
    .setLabel("Entrar na Fila")
    .setStyle("SUCCESS"),
  new MessageButton()
    .setCustomId("leave_queue_valorant")
    .setEmoji("❌")
    .setLabel("Sair da Fila")
    .setStyle("DANGER")
);

export async function handleButtonInteractionQueue_valorant(
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
    const player = await verifyUserState("users_5v5", btnInt.user.id, false);
    const userExist = await verifyUserExist("users_5v5", btnInt.user.id);
    log("Requests feitos");

    const isInQueue = userExist.length !== 0 || player.length !== 0;

    log("Is in queue=", isInQueue);

    switch (btnInt.customId) {
      case "enter_queue_valorant":
        if (isInQueue) {
          log("User already in queue");

          await btnInt.editReply({
            content: " ❌ VOCÊ JA ESTÁ PARTICIPANDO ❌",
            components: [],
          });
          return;
        }

        log("adding user to queue");
        await createUser5v5(btnInt.user.id, btnInt.user.tag, btnInt.guildId);

        log("user added to queue.");
        await btnInt.editReply({
          content: "🎇 VOCÊ ENTROU NA FILA 🎇",
          components: [],
        });
        log("message replied.");
        break;

      case "leave_queue_valorant":
        if (!isInQueue || player.length !== 1) {
          log("User not in queue");

          await btnInt.editReply({
            content: " ❌ VOCÊ NÃO ESTÁ NA FILA ❌",
            components: [],
          });
          return;
        }
        log("removing user from queue");
        await removeUser("users_5v5", btnInt.user.id);
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

let queue: any = "";
let message: any = "";
export default new Command({
  name: "valorant_queue",
  description: "Abre a fila de Valorant",
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

    message = await channel.send({
      embeds: [StartQueue],
      components: [BUTTONS],
    });

    const channelAnnouncement = interaction.guild.channels.cache.get(
      interaction.channel.id
    );
    if (channelAnnouncement.type !== "GUILD_TEXT") {
      return;
    }

    queue = setInterval(
      () =>
        searchMatch_valorant(
          interaction,
          interaction.guildId,
          channelAnnouncement
        ),
      15000
    );
  },
});

export async function takeOffQueue_valorant() {
  await message?.delete();

  return clearInterval(queue);
}

async function searchMatch_valorant(
  interaction,
  guild_id: string,
  channel: TextChannel
) {
  console.log("Procurando partida valorant...");

  const players = await generateTeam5v5(guild_id);

  if (players.length < DISCORD_CONFIG.numbers.MIN_NUM_PLAYERS_TO_5v5_MATCH) {
    return;
  }

  const captain = await valorantCaptainChoose(players);

  const channels = await createChannels(
    interaction,
    players.filter((p) => p.team === "Time 1"),
    players.filter((p) => p.team === "Time 2")
  );

  const annoucements: TextChannel = channels?.textChatAnnouncements;
  const category: CategoryChannel = channels?.category;

  const team1 = players.filter((p) => p.team === 1);
  const team2 = players.filter((p) => p.team === 2);

  try {
    for (const player of team1) {
      Promise.all([
        updateUserTeam("users_5v5", player.user_id, "Time 1"),
        updateInMatch("users_5v5", player.user_id, true),
        updateCategory("users_5v5", player.user_id, category.id),
      ]);
    }
    for (const player of team2) {
      Promise.all([
        updateUserTeam("users_5v5", player.user_id, "Time 2"),
        updateInMatch("users_5v5", player.user_id, true),
        updateCategory("users_5v5", player.user_id, category.id),
      ]);
    }

    await annoucements.send({
      content: `Time 1: <@${players
        .filter((p) => p.team === 1)
        .map((player) => player.user_id)
        .join(">, <@")}>`,
    });
    await annoucements.send({
      content: `Time 2: <@${players
        .filter((p) => p.team === 2)
        .map((player) => player.user_id)
        .join(">, <@")}>`,
    });

    const message_confirm = await annoucements.send({
      embeds: [confirm_message],
    });

    message_confirm.react("👍");

    await createActionAndMessage(
      message_confirm.id,
      "valorant_confirm_presence"
    );
  } catch (error) {
    console.log(error);
  }
  setTimeout(() => searchMatch_valorant(interaction, guild_id, channel), 10000);
  return players;
}

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

        const captain = await fetchCapitainValorant(
          channel.parentId,
          btnInt.guildId
        );
        const user = await client.users.fetch(captain?.user_id);
        await channel.messages.delete(btnInt.message.id);

        await channel.permissionOverwrites.edit(user, {
          SEND_MESSAGES: true,
        });

        await btnInt.deleteReply(); // delete thinking message

        const CaptainMessage = new MessageEmbed()
          .setColor("#fd4a5f")
          .setTitle("Feedback da Partida.")
          .setDescription(
            `<@${captain.user_id}> Envie print do resultado da partida neste canal.`
          );

        // display menu

        const sendMessage = await btnInt.channel.send({
          embeds: [FinishLobby],
        });
        await channel.send({
          content: `<@${captain.user_id}>`,
        });

        await channel.send({
          embeds: [CaptainMessage],
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
