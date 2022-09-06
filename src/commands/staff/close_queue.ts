import { Message, MessageEmbed } from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { Command } from "../../structures/Command";
import { embedPermission } from "../../utils/embeds";
import { takeOffQueue_lol } from "./lol_queue";
import { takeOffQueue_valorant } from "./valorant_queue";

const choices = [
  {
    name: "Valorant",
    value: "VALORANT",
  },
  {
    name: "League of Legends",
    value: "LEAGUE_OF_LEGENDS",
  },
];
export default new Command({
  name: "fecharfila",
  description: "Encerra a procura de partida do jogo escolhido",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    {
      name: "game",
      description: "Jogo",
      type: "STRING",
      required: true,
      choices,
    },
  ],
  run: async ({ interaction }) => {
    const game = interaction.options.getString("game");

    if (
      !interaction.memberPermissions.has("ADMINISTRATOR") &&
      interaction.user.id !== DISCORD_CONFIG.mockAdminId
    ) {
      await interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }

    switch (game) {
      case "LEAGUE_OF_LEGENDS":
        try {
          await takeOffQueue_lol();

          await interaction.deleteReply();

          const channel = interaction.channel;
          if (channel.type !== "GUILD_TEXT") return;

          const EMBEDCLOSEQUEUE = new MessageEmbed()
            .setColor("#fd4a5f")
            .setTitle("Fila encerrada")
            .setDescription(`Filas de League of legends encerradas por hoje!`);

          const message = await channel.send({
            embeds: [EMBEDCLOSEQUEUE],
          });
          setTimeout(async () => await message.delete(), 3000);
        } catch (error) {
          await interaction.deleteReply();
          const channel = interaction.channel;
          if (channel.type !== "GUILD_TEXT") return;
          const EMBEDCLOSEQUEUEERROR = new MessageEmbed()
            .setColor("#fd4a5f")
            .setTitle("Aviso!")
            .setDescription(
              `Fila de league of legends não está ativa no momento!`
            );

          const message = await channel.send({
            embeds: [EMBEDCLOSEQUEUEERROR],
          });
          setTimeout(async () => await message.delete(), 3000);
        }
        break;

      case "VALORANT":
        try {
          await takeOffQueue_valorant();

          await interaction.deleteReply();

          const channel = interaction.channel;
          if (channel.type !== "GUILD_TEXT") return;

          const EMBEDCLOSEQUEUE = new MessageEmbed()
            .setColor("#fd4a5f")
            .setTitle("Fila encerrada")
            .setDescription(`Filas de Valorant encerradas por hoje!`);

          const message = await channel.send({
            embeds: [EMBEDCLOSEQUEUE],
          });
          setTimeout(async () => await message.delete(), 3000);
        } catch (error) {
          await interaction.deleteReply();
          const channel = interaction.channel;
          if (channel.type !== "GUILD_TEXT") return;
          const EMBEDCLOSEQUEUEERROR = new MessageEmbed()
            .setColor("#fd4a5f")
            .setTitle("Aviso!")
            .setDescription(`Fila de Valorant não está ativa no momento!`);

          const message: Message = await channel.send({
            embeds: [EMBEDCLOSEQUEUEERROR],
          });
          setTimeout(async () => await message.delete(), 3000);
        }
    }
  },
});
