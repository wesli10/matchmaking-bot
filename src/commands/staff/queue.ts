import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { Command } from "../../structures/Command";
import {
  createUser,
  verifyUserState,
  removeUser,
  fetchUsersInQueue,
  verifyUserExist,
  clearQueue,
} from "../../utils/db";
import { clear } from "../../utils/utils";

export default new Command({
  name: "openqueue",
  description: "Open queue to players",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const buttons = new MessageActionRow().addComponents(
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

    const embedLobby = new MessageEmbed().setColor("RANDOM").setDescription(
      `Seja bem-vindo à fila de X1 dos Crias na SNACKCLUB.\n 
        Aqui você poderá aguardar na fila para participar de um dos nossos lobbies. \n 
        Clique em 🎮 Entrar para entrar na fila, e em ❌ Sair para sair da fila. \n `
    );

    const buttonQueue = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("stop_queue")
        .setEmoji("🛑")
        .setLabel("Parar Fila")
        .setStyle("SECONDARY")
    );
    const embedPermission = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        "❌❌ You don't have the permissions to use this command! ❌❌"
      );

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      await interaction.followUp({
        content: "@here Fila Aberta!",
        components: [buttons],
        embeds: [embedLobby],
      });
      await interaction.followUp({
        content: "Quando quiser Pare a fila",
        components: [buttonQueue],
        embeds: [],
        ephemeral: true,
      });

      const collector = interaction.channel.createMessageComponentCollector({});

      collector.on("collect", async (btnInt: ButtonInteraction) => {
        const player = await verifyUserState(btnInt.user.id, false);
        let playersCount = await fetchUsersInQueue();

        const userExist = await verifyUserExist(btnInt.user.id);
        switch (btnInt.customId) {
          case "enter_queue":
            if (userExist.length === 0 && player.length === 0) {
              await createUser(btnInt.user.id, btnInt.user.tag);
              await btnInt.reply({
                content: "🎇 VOCÊ ENTROU NA FILA 🎇",
                components: [],
                ephemeral: true,
              });
            } else {
              await btnInt.reply({
                content: " ❌ VOCÊ JA ESTÁ PARTICIPANDO ❌",
                components: [],
                ephemeral: true,
              });
            }
            await interaction.editReply({
              content: `@here JOGADORES NA FILA: ${playersCount.length}`,
              embeds: [embedLobby],
              components: [buttons],
            });
            break;
          case "leave_queue":
            if (userExist.length === 1 && player.length === 1) {
              await removeUser(btnInt.user.id);
              await btnInt.reply({
                content: "❌ VOCÊ SAIU DA FILA ❌",
                components: [],
                ephemeral: true,
              });
            } else {
              await btnInt.reply({
                content: " ❌ VOCÊ NÃO ESTÁ NA FILA ❌",
                components: [],
                ephemeral: true,
              });
            }
            await interaction.editReply({
              content: `@here JOGADORES NA FILA: ${playersCount.length}`,
              embeds: [embedLobby],
              components: [buttons],
            });
            break;
          case "stop_queue":
            btnInt.update({
              content: "Fila Parada",
              components: [],
              embeds: [],
            });
            collector.stop();
            break;
        }
      });
      collector.on("end", async (collected) => {
        clear(interaction);
        await clearQueue();
      });
    } else {
      interaction.editReply({
        embeds: [embedPermission],
      });
    }
  },
});
