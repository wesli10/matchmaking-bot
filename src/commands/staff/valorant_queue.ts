import { Command } from "../../structures/Command";
import {
  ButtonInteraction,
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
} from "../../utils/db";
import { embedPermission } from "../../utils/embeds";
import { DISCORD_CONFIG } from "../../configs/discord.config";

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

export default new Command({
  name: "valorant_queue",
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
  },
});
