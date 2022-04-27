import { Command } from "../../structures/Command";
import { fetchUsersInQueue } from "../../utils/db";

export default new Command({
  name: "fila",
  description: "Mostra a quantidade de players na fila",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const queue = await fetchUsersInQueue();
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const roleTeste = "965501155016835085";
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
        ephemeral: true,
      });
    }
  },
});
