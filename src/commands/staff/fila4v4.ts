import { Command } from "../../structures/Command";
import { fetchUsersInQueue, fetchUsersInQueue4v4 } from "../../utils/db";

export default new Command({
  name: "fila4v4",
  description: "Mostra a quantidade de players na fila",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const queue = await fetchUsersInQueue4v4();

    await interaction.followUp({
      content: `A fila está com ${queue.length} jogadores!`,
      components: [],
      embeds: [],
    });
  },
});
