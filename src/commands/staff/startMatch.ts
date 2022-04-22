import { Command } from "../../structures/Command";
import { players } from "../staff/queue";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: "startmatch",
  description: "Give role to each player in queue and start the match",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const channel = interaction.channelId;
    const lobby1 = interaction.guild.channels.cache.find(
      (c) => c.name === "lobby-1"
    ).id;
    const lobby2 = interaction.guild.channels.cache.find(
      (c) => c.name === "lobby-2"
    ).id;

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        "❌❌ You don't have the permissions to use this command! ❌❌"
      );

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      players.map((player) => {
        if (
          player.channelId === channel &&
          channel === lobby2 &&
          players.filter((p) => p.channelId === lobby1).length != 0
        ) {
          const member = interaction.guild.members.cache.get(player.playerId);
          member.roles.add(process.env.Lobby2Role);
          member.voice
            .setChannel(process.env.LOBBY2)
            .catch((err) => console.log(err));
          interaction.editReply({
            content: "Boa sorte na Partida!",
          });
        } else if (
          player.channelId === channel &&
          channel === lobby1 &&
          players.filter((p) => p.channelId === lobby1).length != 0
        ) {
          const member = interaction.guild.members.cache.get(player.playerId);
          member.roles.add(process.env.Lobby1Role);
          member.voice
            .setChannel(process.env.LOBBY1)
            .catch((err) => console.log(err));
          interaction.editReply({
            content: "Boa sorte na Partida!",
          });
        } else {
          interaction.followUp({
            content: "Não há jogadores na fila",
            ephemeral: true,
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
