import { MessageEmbed } from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { Command } from "../../structures/Command";
import { clearQueue } from "../../utils/db";
import { embedPermission } from "../../utils/embeds";

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
  name: "resetar",
  description:
    "RESETA A FILA ATUAL DO GAME 🚨 CERTIFIQUE-SE QUE NÃO TEM PARTIDAS ROLANDO !!! 🚨",
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

    const channel = interaction.channel;
    if (channel.type !== "GUILD_TEXT") {
      return;
    }

    switch (game) {
      case "VALORANT":
        // RESET QUEUE VALORANT

        await clearQueue("users_5v5", interaction.guild.id);

        // delete thinking message
        await interaction.deleteReply();

        const embed_reset_valorant = new MessageEmbed()
          .setColor("#fd4a5f")
          .setTitle("Fila")
          .setDescription("\n 🚨 FILA DE VALORANT RESETADA !!! 🚨");

        const message_valorant = await channel.send({
          embeds: [embed_reset_valorant],
        });

        setTimeout(async () => await message_valorant.delete(), 3000);

        break;

      case "LEAGUE_OF_LEGENDS":
        await clearQueue("queue_lol", interaction.guild.id);

        // delete thinking message
        await interaction.deleteReply();

        const embed_reset_lol = new MessageEmbed()
          .setColor("#fd4a5f")
          .setTitle("Fila")
          .setDescription("\n 🚨 FILA DE LEAGUE OF LEGENDS RESETADA !!! 🚨");

        const message_lol = await channel.send({
          embeds: [embed_reset_lol],
        });

        setTimeout(async () => await message_lol.delete(), 3000);

        break;
    }
  },
});
