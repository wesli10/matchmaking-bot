import {
  MessageActionRow,
  MessageButton,
  Interaction,
  MessageEmbed,
} from "discord.js";
import { Command } from "../../structures/Command";

const players = [];

export default new Command({
  name: "queue",
  description: "Player enter in queue",
  userPermissions: ["MANAGE_MESSAGES"],
  run: async ({ interaction }) => {
    const user = interaction.user.id;

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

    if (!players.includes(user)) {
      interaction.editReply({
        components: [button1],
      });
    } else {
      interaction.editReply({
        content: "Você já está na fila",
        components: [button2],
      });
    }

    const filter = (btnInt: Interaction) => {
      return interaction.user.id === btnInt.user.id;
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 15,
    });

    collector.on("end", async (collection) => {
      collection.forEach((click) => {
        console.log(click.user.id, click.customId);
      });

      if (
        collection.first()?.customId === "enter_queue" &&
        !players.includes(user)
      ) {
        players.push(user);
        interaction.editReply({
          content: "Você está na fila!! 🏃🏼‍♀️",
          components: [],
        });
      } else if (
        collection.first()?.customId === "leave_queue" &&
        players.includes(user)
      ) {
        players.splice(players.indexOf(user), 1);
        interaction.editReply({
          content: "Você saiu da fila!! ❌",
          components: [],
        });
      }
    });

    console.log("🎮");
  },
});
