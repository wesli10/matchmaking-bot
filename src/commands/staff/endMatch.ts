import { Command } from "../../structures/Command";
import { players } from "../staff/queue";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: "endmatch",
  description: "Remove tags and move out user from lobby room",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const channelId = interaction.channelId;
    const lobby1 = interaction.guild.channels.cache.find(
      (c) => c.name === "lobby-1"
    ).id;
    const lobby2 = interaction.guild.channels.cache.find(
      (c) => c.name === "lobby-2"
    ).id;

    async function clear() {
      const fetched = await interaction.channel.messages.fetch({
        limit: 100,
      });
      if (interaction.channel.type === "DM") return;
      interaction.channel.bulkDelete(fetched);
    }

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        " ❌❌ You don't have the permissions to use this command! ❌❌"
      );

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      players.map((player) => {
        if (player.channelId === channelId && channelId === lobby2) {
          const member = interaction.guild.members.cache.get(player.playerId);
          member.roles.remove(process.env.Lobby2Role);
          member.voice
            .setChannel(process.env.WaitingRoom)
            .catch((err) => console.error(err));
          interaction
            .followUp({
              content: "Obrigado por participar!",
              ephemeral: true,
            })
            .then((player) => {
              players.splice(players.indexOf(player), 1);
            });
        } else if (player.channelId === channelId && channelId === lobby1) {
          const member = interaction.guild.members.cache.get(player.playerId);
          member.roles.remove(process.env.Lobby1Role);
          member.voice
            .setChannel(process.env.WaitingRoom)
            .catch((err) => console.error(err));
          interaction
            .followUp({
              content: "Obrigado por participar",
              ephemeral: true,
            })
            .then((player) => {
              players.splice(players.indexOf(player), 1);
            });
        } else {
          interaction.followUp({
            content: "Não tem lobby rolando agora!",
            ephemeral: true,
          });
        }
      });
    } else {
      interaction.editReply({
        embeds: [embed],
      });
    }
    clear();
  },
});
