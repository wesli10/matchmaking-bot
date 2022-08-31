import { Message, MessageEmbed } from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { Command } from "../../structures/Command";
import { fetchUsersInQueue } from "../../utils/db";
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

let embedBefore;
export default new Command({
  name: "fila",
  description: "Mostra a quantidade de players na fila",
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
    const role1 = DISCORD_CONFIG.roles.moderator;
    const role2 = DISCORD_CONFIG.roles.event;
    const role3 = DISCORD_CONFIG.roles.aux_event;
    const game = interaction.options.getString("game");
    const roleTeste = DISCORD_CONFIG.roles.admin;
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      if (game === "LEAGUE_OF_LEGENDS") {
        const queue = await fetchUsersInQueue("queue_lol");
        await embedBefore?.delete().catch(console.error);
        const LOG_FILA = new MessageEmbed().setColor("#fd4a5f").setDescription(`
        Total de participantes do Evento: ${queue.length} \n\n 
        Top-laners: ${queue.filter((p) => p.role === "Top-laner").length} \n
        Junglers: ${queue.filter((p) => p.role === "Jungler").length} \n 
        Mid-laners: ${queue.filter((p) => p.role === "Mid-laner").length} \n
        Adc's: ${queue.filter((p) => p.role === "AD Carry").length} \n
        Suportes: ${queue.filter((p) => p.role === "Support").length} \n`);

        embedBefore = await interaction.followUp({
          embeds: [LOG_FILA],
        });
      } else if (game === "VALORANT") {
        const queue = await fetchUsersInQueue("users_5v5");
        await embedBefore?.delete().catch(console.error);
        const LOG_FILA = new MessageEmbed().setColor("#fd4a5f").setDescription(`
        Jogadores da Fila: ${queue.length}`);

        embedBefore = await interaction.followUp({
          embeds: [LOG_FILA],
        });
      }
    } else {
      await interaction.followUp({
        embeds: [embedPermission],
      });
    }
  },
});
