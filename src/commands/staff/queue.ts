import {
  ButtonInteraction,
  Client,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { Command } from "../../structures/Command";
import {
  createUser,
  verifyUserState,
  removeUser,
  verifyUserExist,
  isBanned,
} from "../../utils/db";
import { format, parseISO } from "date-fns";

const BUTTONS = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("enter_queue")
    .setEmoji("🎮")
    .setLabel("Entrar na Fila")
    .setStyle("SUCCESS"),
  new MessageButton()
    .setCustomId("leave_queue")
    .setEmoji("❌")
    .setLabel("Sair da Fila")
    .setStyle("DANGER")
);

const EMBED_LOBBY = new MessageEmbed().setColor("#fd4a5f").setDescription(
  `Seja bem-vindo à fila de Sala Premiada na SNACKCLUB.\n 
    Aqui você poderá aguardar na fila para participar de um dos nossos lobbies. \n 
    Clique em 🎮 Entrar para entrar na fila, e em ❌ Sair para sair da fila. \n `
);

const EMBED_PERMISSIONS = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Negativo")
  .setDescription("❌❌ Você não tem permissão para usar esse comando! ❌❌");

export async function handleButtonInteraction(btnInt: ButtonInteraction) {
  const log = (...message: any[]) => {
    console.log(`[${btnInt.user.username}] --`, ...message);
  };

  try {
    await btnInt.deferReply({
      ephemeral: true,
      fetchReply: false,
    });

    log("Iniciando ação do botão", btnInt.customId);
    const player = await verifyUserState("users", btnInt.user.id, false);
    const userExist = await verifyUserExist("users", btnInt.user.id);
    log("Requests feitos");

    const isInQueue = userExist.length !== 0 || player.length !== 0;

    log("Is in queue=", isInQueue);

    switch (btnInt.customId) {
      case "enter_queue":
        if (isInQueue) {
          log("User already in queue");

          await btnInt.editReply({
            content: " ❌ VOCÊ JA ESTÁ PARTICIPANDO ❌",
            components: [],
          });
          return;
        }

        const banned = await isBanned(btnInt.user.id);

        if (banned) {
          log("User is banned");

          await btnInt.editReply({
            content: ` ❌ VOCÊ ESTÁ BANIDO DA FILA ATÉ ${format(
              parseISO(banned.end_date),
              "dd/MM/yyyy HH:mm"
            )} ❌`,
            components: [],
          });
          return;
        }

        log("adding user to queue");
        await createUser(btnInt.user.id, btnInt.user.tag, btnInt.guildId);

        log("user added to queue.");
        await btnInt.editReply({
          content: "🎇 VOCÊ ENTROU NA FILA 🎇",
          components: [],
        });
        log("message replied.");
        break;

      case "leave_queue":
        if (!isInQueue || player.length !== 1) {
          log("User not in queue");

          await btnInt.editReply({
            content: " ❌ VOCÊ NÃO ESTÁ NA FILA ❌",
            components: [],
          });
          return;
        }
        log("removing user from queue");
        await removeUser("users", btnInt.user.id);
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
  name: "abrirfila",
  description: "Open queue to players",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const queueRoom_id = DISCORD_CONFIG.channels.queue_room_id;

    if (
      !interaction.memberPermissions.has("ADMINISTRATOR") &&
      interaction.user.id !== DISCORD_CONFIG.mockAdminId
    ) {
      interaction
        .editReply({
          embeds: [EMBED_PERMISSIONS],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }

    // Send a quick message to reply to the admin
    interaction
      .followUp({
        content: "⠀",
      })
      // then delete right after...
      .then(() => interaction.deleteReply());

    const channel = interaction.guild.channels.cache.get(
      queueRoom_id
    ) as TextChannel;

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: "BUTTON",
    });

    // Handling on interaction
    // collector.on("collect", handleButtonInteraction);

    collector.on("end", (collected) => {
      console.log(`Ended collecting ${collected.size} items`);
    });

    // Now that everything is setup, send message

    const message = await channel.send({
      content: "Fila Aberta!",
      embeds: [EMBED_LOBBY],
      components: [BUTTONS],
    });
  },
});
