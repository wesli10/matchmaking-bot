import { Command } from "../../structures/Command";
import {
  ButtonInteraction,
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
} from "../../utils/db";
import { embedPermission } from "../../utils/embeds";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { generateTeam5v5_lol } from "../../utils/5v5/generateTeam5v5_lol";

const { channels } = DISCORD_CONFIG;

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

    // Send a quick message to reply to the admin
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

    await testeRecursive(interaction.guildId, channelAnnouncement);
  },
});

async function testeRecursive(guild_id: string, channel: TextChannel) {
  const teste = await generateTeam5v5_lol(guild_id);

  if (teste === undefined) {
    console.log("Procurando...");
    setTimeout(() => testeRecursive(guild_id, channel), 5000);
  }

  if (teste !== undefined) {
    try {
      for (const player of teste.time1) {
        Promise.all([updateInMatch("queue_lol", player.user_id, true)]);
      }
      for (const player of teste.time2) {
        Promise.all([updateInMatch("queue_lol", player.user_id, true)]);
      }
      console.log("Partida encontrada");
      const StartLOL = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle("PARTIDA ENCONTRADA")
        .setDescription(
          ` Time 1: \n ${teste.time1
            .map((player) => `<@${player.user_id}> : ${player.role}`)
            .join("\n")} \n\n Time 2: \n ${teste.time2
            .map((player) => `<@${player.user_id}> : ${player.role}`)
            .join("\n")}`
        );
      await channel.send({
        embeds: [StartLOL],
      });
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => testeRecursive(guild_id, channel), 5000);
    return teste;
  }
}
