import { MessageEmbed } from "discord.js";
import { Command } from "../../structures/Command";
import { getAllMembersOnEvent } from "../../utils/db";

export default new Command({
  name: "evento",
  description: "Mostra a quantidade de pessoas participando do evento",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const allMembers = await getAllMembersOnEvent();
    const usersInMatch = allMembers.filter(
      (member) => member.in_match === true
    );
    const usersNotInMatch = allMembers.filter(
      (member) => member.in_match === false
    );

    const EMBED_LOG = new MessageEmbed().setColor("#fd4a5f").setDescription(`
    Total de participantes do Evento: ${allMembers.length} \n\n Jogadores em Fila: ${usersNotInMatch.length} \n\n Jogadores em Partida: ${usersInMatch.length} `);

    await interaction.followUp({
      embeds: [EMBED_LOG],
    });
  },
});
