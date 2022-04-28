import {
  ButtonInteraction,
  Client,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel,
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
  name: "abrirfila",
  description: "Open queue to players",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const queueRoom_id = "968922689190371328";
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

    const embedLobby = new MessageEmbed().setColor("#fd4a5f").setDescription(
      `Seja bem-vindo à fila de Sala Premiada na SNACKCLUB.\n 
        Aqui você poderá aguardar na fila para participar de um dos nossos lobbies. \n 
        Clique em 🎮 Entrar para entrar na fila, e em ❌ Sair para sair da fila. \n `
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
      interaction
        .followUp({
          content: "⠀",
        })
        .then(() => interaction.deleteReply());

      const channel = interaction.guild.channels.cache.get(
        queueRoom_id
      ) as TextChannel;

      channel.send({
        content: "Fila Aberta!",
        embeds: [embedLobby],
        components: [buttons],
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
          }
        } catch (error) {
          console.log(error);
        }
      });
    } else {
      interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));
    }
  },
});
