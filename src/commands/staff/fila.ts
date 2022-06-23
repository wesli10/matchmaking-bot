import { Command } from "../../structures/Command";
import { fetchUsersInQueue } from "../../utils/db";

export default new Command({
  name: "fila",
  description: "Mostra a quantidade de players na fila",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const queue = await fetchUsersInQueue();
    const role1 = process.env.DISCORD_ROLE_MODERATOR;
    const role2 = process.env.DISCORD_ROLE_EVENT;
    const role3 = process.env.DISCORD_ROLE_AUX_EVENT;
    const roleTeste = process.env.DISCORD_ROLE_ADMIN;
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      await interaction.followUp({
        content: `A fila está com ${queue.length} jogadores!`,
        components: [],
        embeds: [],
      });
    }
  },
});
