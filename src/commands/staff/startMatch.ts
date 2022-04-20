import { Command } from "../../structures/Command";
import { players } from "../staff/queue";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: "startmatch",
  description: "Give role to each player in queue and start the match",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const channel = interaction.channelId;
    const lobby1 = "966105846704644237";
    const lobby2 = "966105588771729438";

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        " ❌❌ You don't have the permissions to use this command! ❌❌"
      );

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      players.map((player) => {
        if (player.channelId === channel && channel === lobby2) {
          const member = interaction.guild.members.cache.get(player.playerId);
          member.roles.add("966102139107704832");
          interaction.editReply({
            content: "Boa partida!",
          });
        } else if (player.channelId === channel && channel === lobby1) {
          const member = interaction.guild.members.cache.get(player.playerId);
          member.roles.add("966101988045623357");
          interaction.editReply({
            content: "Boa partida!",
          });
        } else {
          interaction.editReply({
            content: "Não há jogadores na fila",
          });
        }
      });
    } else {
      interaction.editReply({
        embeds: [embed],
      });
    }
  },
});
