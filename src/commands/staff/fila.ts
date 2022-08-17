import { MessageEmbed } from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { Command } from "../../structures/Command";
import { fetchUsersInQueue } from "../../utils/db";

export default new Command({
  name: "fila",
  description: "Mostra a quantidade de players na fila",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const queue = await fetchUsersInQueue();
    const role1 = DISCORD_CONFIG.roles.moderator;
    const role2 = DISCORD_CONFIG.roles.event;
    const role3 = DISCORD_CONFIG.roles.aux_event;
    const roleTeste = DISCORD_CONFIG.roles.admin;
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      const LOG_FILA = new MessageEmbed().setColor("#fd4a5f").setDescription(`
      Total de participantes do Evento: ${queue.length} \n\n 
      Top-laners: ${queue.filter((p) => p.role === "Top-laner").length} \n
      Junglers: ${queue.filter((p) => p.role === "Jungler").length} \n 
      Mid-laners: ${queue.filter((p) => p.role === "Mid-laner").length} \n
      Adc's: ${queue.filter((p) => p.role === "AD Carry").length} \n
      Suportes: ${queue.filter((p) => p.role === "Support").length} \n`);

      await interaction.followUp({
        embeds: [LOG_FILA],
      });
    }
  },
});
