import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { Command } from "../../structures/Command";

export const players = [];

export default new Command({
  name: "openqueue",
  description: "Open queue to players",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const channelId = interaction.channelId;
    const channelName = interaction.guild.channels.cache.get(channelId).name;

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
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(`Fila de ${channelName}`)
      .setDescription("🎮 **Entre na fila** para jogar!");

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      await interaction.followUp({
        content: "@here Fila Aberta!",
        components: [buttons],
        embeds: [embed],
      });
      await interaction.followUp({
        content: "Quando quiser Pare a fila",
        components: [buttonQueue],
        embeds: [],
        ephemeral: true,
      });

      const collector = interaction.channel.createMessageComponentCollector({});

      collector.on("collect", async (btnInt) => {
        const channelId = interaction.channelId;
        switch (btnInt.customId) {
          case "enter_queue":
            if (!players.find((player) => player.playerId === btnInt.user.id)) {
              players.push({
                playerId: btnInt.user.id,
                channelId: channelId,
              });
              await btnInt.deferReply({
                ephemeral: true,
                fetchReply: true,
              });
              await btnInt.editReply({
                content: "🎇 VOCÊ ENTROU NA FILA 🎇",
                components: [],
              });
            } else {
              await btnInt.deferReply({
                ephemeral: true,
                fetchReply: true,
              });
              await btnInt.editReply({
                content: " ❌ VOCÊ JA ESTÁ NA FILA ❌",
                components: [],
              });
            }
            await interaction.editReply({
              content: `Jogadores na Fila: ${
                players.filter(
                  (player) => player.channelId === btnInt.channelId
                ).length
              }`,
              components: [buttons],
              embeds: [embed],
            });
            break;
          case "leave_queue":
            if (players.find((player) => player.playerId === btnInt.user.id)) {
              players.splice(
                players.findIndex(
                  (player) => player.playerId === btnInt.user.id
                ),
                1
              );
              await btnInt.deferReply({
                ephemeral: true,
                fetchReply: true,
              });
              await btnInt.followUp({
                content: "❌ VOCÊ SAIU DA FILA ❌",
                components: [],
              });
            } else {
              await btnInt.deferReply({
                ephemeral: true,
                fetchReply: true,
              });
              await btnInt.editReply({
                content: " ❌ VOCÊ NÃO ESTÁ NA FILA ❌",
                components: [],
              });
            }
            await interaction.editReply({
              content: `Jogadores na Fila: ${
                players.filter(
                  (player) => player.channelId === btnInt.channelId
                ).length
              }`,
              components: [buttons],
              embeds: [embed],
            });
            break;
          case "stop_queue":
            await interaction.editReply({
              content:
                "@here 🎇 \n\n FILA FECHADA!!! 🎇 \n\n A PARTIDA JA VAI COMEÇAR!!!",
              components: [],
              embeds: [],
            });
            await btnInt.deferUpdate({
              fetchReply: true,
            });
            await btnInt.editReply({
              content: "Digite /startmatch para iniciar a partida",
              components: [],
              embeds: [],
            });
            collector.stop();
            break;
        }
      });
      collector.on("end", async (collected) => {
        players.forEach((player) => {
          console.log(player);
        });
      });
    } else {
      interaction.editReply({
        embeds: [embedPermission],
      });
    }
  },
});
