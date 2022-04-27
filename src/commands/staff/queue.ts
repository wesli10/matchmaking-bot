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

export default new Command({
  name: "openqueue",
  description: "Open queue to players",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const roleTeste = "965501155016835085";

    const admin = JSON.stringify(interaction.member.roles.valueOf());

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

    const embedQueueClosed = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Fila Fechada!")
      .setDescription(
        "As filas estão fechadas no momento, tente novamente em outro horário!"
      );

    const embedPermission = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Negativo")
      .setDescription(
        "❌❌ Você não tem permissão para usar esse comando! ❌❌"
      );

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
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
        try {
          const player = await verifyUserState(btnInt.user.id, false);
          let playersCount = await fetchUsersInQueue();
          const userExist = await verifyUserExist(btnInt.user.id);

          switch (btnInt.customId) {
            case "enter_queue":
              if (userExist.length === 0 && player.length === 0) {
                await btnInt
                  .reply({
                    content: "🎇 VOCÊ ENTROU NA FILA 🎇",
                    components: [],
                    ephemeral: true,
                  })
                  .then(() => createUser(btnInt.user.id, btnInt.user.tag))
                  .catch((err) => console.log(err));
              } else {
                await btnInt.reply({
                  content: " ❌ VOCÊ JA ESTÁ PARTICIPANDO ❌",
                  components: [],
                  ephemeral: true,
                });
              }
              break;
            case "leave_queue":
              if (userExist.length === 1 && player.length === 1) {
                await btnInt.deferReply({
                  ephemeral: true,
                  fetchReply: false,
                });
                try {
                  await btnInt.editReply({
                    content: "❌ VOCÊ SAIU DA FILA ❌",
                    components: [],
                  });
                  await removeUser(btnInt.user.id);
                } catch (err) {
                  console.log(err);
                }
              } else {
                await btnInt.reply({
                  content: " ❌ VOCÊ NÃO ESTÁ NA FILA ❌",
                  components: [],
                  ephemeral: true,
                });
              }
              break;
            case "stop_queue":
              interaction.editReply({
                content: "...",
                embeds: [embedQueueClosed],
                components: [],
              });
              collector.stop();
              await clearQueue();
          }
        } catch (error) {
          console.log(error);
        }
      });
      collector.on("end", async (collected) => {});
    } else {
      interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 5000));
    }
  },
});
