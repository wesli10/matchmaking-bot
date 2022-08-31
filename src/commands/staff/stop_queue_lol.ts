import { MessageEmbed } from "discord.js";
import { Command } from "../../structures/Command";
import { takeOffQueue_lol } from "./lol_queue";

export default new Command({
  name: "stop_queue_lol",
  description: "Encerra a fila de League Of Legends",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    try {
      await takeOffQueue_lol();

      await interaction.deleteReply();

      const channel = interaction.channel;
      if (channel.type !== "GUILD_TEXT") return;

      const EMBEDCLOSEQUEUE = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle("Fila encerrada")
        .setDescription(`Fila encerrada por hoje!`);

      await channel.send({
        embeds: [EMBEDCLOSEQUEUE],
      });
    } catch (error) {
      await interaction.deleteReply();
      const channel = interaction.channel;
      if (channel.type !== "GUILD_TEXT") return;
      const EMBEDCLOSEQUEUEERROR = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle("Aviso!")
        .setDescription(`Fila de league of legends não está ativa no momento!`);

      await channel.send({
        embeds: [EMBEDCLOSEQUEUEERROR],
      });
    }
  },
});
