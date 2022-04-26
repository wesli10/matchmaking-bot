import { Command } from "../../structures/Command";
import {
  fetchUsersInQueue,
  updateInMatch,
  createQueue,
  fetchUsersQtd,
  createUserQueue,
  updateUserChannel,
  fetchChannels,
  updateUserRole,
} from "../../utils/db";
import { MessageEmbed } from "discord.js";
import { players } from "./queue";

export default new Command({
  name: "startmatch",
  description: "Give role to each player in queue and start the match",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    {
      name: "jogadores",
      description: "Number of players in the match",
      type: "NUMBER",
      required: true,
    },
    {
      name: "channel",
      description: "The channel to startmach",
      type: "CHANNEL",
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const channel = interaction.options.getChannel("channel");
    const qtdPlayers = interaction.options.getNumber("jogadores");
    const qtdQueue = await fetchUsersInQueue();
    const lobby = await fetchChannels(channel.id);
    await createQueue(channel.id, interaction.guildId);

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        "❌❌ You don't have the permissions to use this command! ❌❌"
      );
    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      if (channel.type === "GUILD_VOICE" && lobby.length != 0) {
        if (qtdQueue.length >= qtdPlayers) {
          players.splice(0, qtdPlayers);
          await fetchUsersQtd(qtdPlayers).then((data) => {
            data.map((p) => {
              const member = interaction.guild.members.cache.get(p.user_id);
              member.roles
                .add(lobby[0].role_id)
                .catch((err) => console.log(err));
              member.voice
                .setChannel(channel.id)
                .catch((err) => console.error(err));
              updateInMatch(p.user_id, true);
              updateUserChannel(p.user_id, channel.id);
              updateUserRole(p.user_id, lobby[0].role_id);
              createUserQueue(p.user_id, channel.id, channel.name);
            });
          });
          await interaction
            .followUp({
              content: "Match started!",
              components: [],
            })
            .catch((err) => console.error(err));
        } else {
          await interaction
            .followUp({
              content: " ❌ ENOUGH PLAYERS IN QUEUE! ❌",
            })
            .catch((err) => console.error(err));
        }
      } else {
        await interaction.editReply({
          content: "Channel Invalid!",
          embeds: [],
          components: [],
        });
      }
    } else {
      await interaction.reply({
        embeds: [embed],
      });
    }
  },
});
