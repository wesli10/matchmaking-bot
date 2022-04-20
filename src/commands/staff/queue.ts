import {
  MessageActionRow,
  MessageButton,
  Interaction,
  MessageEmbed,
} from "discord.js";
import { Command } from "../../structures/Command";

export type PlayersType = {
  playersId: string;
  channelId: string;
};

export const players = [];

export default new Command({
  name: "queue",
  description: "Player enter in queue",
  run: async ({ interaction }) => {
    const user = interaction.user.id;
    const channelId = interaction.channelId;

    const button1 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("enter_queue")
        .setEmoji("🎮")
        .setLabel("Entrar na Fila")
        .setStyle("SUCCESS")
    );

    const button2 = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("leave_queue")
        .setEmoji("❌")
        .setLabel("Sair da Fila")
        .setStyle("DANGER")
    );

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("🎮 Fila de Jogos")
      .setDescription(`${players.length} jogadores na fila`);

    if (!players.find((player) => player.playerId === user)) {
      interaction.editReply({
        components: [button1],
      });
    } else {
      interaction.editReply({
        content: "Você já está na fila",
        components: [button2],
        embeds: [embed],
      });
    }

    const filter = (btnInt: Interaction) => {
      return interaction.user.id === btnInt.user.id;
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      max: 1,
    });

    collector.on("end", async (collection) => {
      if (
        collection.first()?.customId === "enter_queue" &&
        !players.find((player) => player.playerId === user)
      ) {
        players.push({
          playerId: user,
          channelId: channelId,
        });
        interaction.editReply({
          content: "Você está na fila!! 🏃🏼‍♀️",
          components: [],
        });
      } else if (
        collection.first()?.customId === "leave_queue" &&
        players.find((player) => player.playerId === user)
      ) {
        players.splice(
          players.indexOf({
            playerId: user,
          }),
          1
        );
        interaction.editReply({
          content: "Você saiu da fila!! ❌",
          components: [],
          embeds: [],
        });
      }
    });
  },
});
