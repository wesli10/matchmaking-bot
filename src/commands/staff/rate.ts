import { MessageEmbed } from "discord.js";
import { Command } from "../../structures/Command";
import { fetchUser4v4Feedback } from "../../utils/db";

export default new Command({
  name: "rate",
  description: "Remove todos os usuario da fila",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false,
    });

    const result = await fetchUser4v4Feedback(interaction.user.id);
    const matchsPlayed = result.filter(
      (player) =>
        player.user_id === interaction.user.id && player.result !== "Cancelado"
    );
    const wonMatchs = result.filter((player) => player.result === "Venceu");
    const loseMatchs = result.filter((player) => player.result === "Perdeu");

    const EMBED_FEEDBACK = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("W/L")
      .setDescription(
        `Partidas Jogadas: ${matchsPlayed.length} \n\n Venceu: ${wonMatchs.length} \n\n Perdeu: ${loseMatchs.length}`
      );

    await interaction.editReply({
      embeds: [EMBED_FEEDBACK],
    });
  },
});
