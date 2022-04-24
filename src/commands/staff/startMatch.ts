import { Command } from "../../structures/Command";
import {
  fetchUsers,
  updateInMatch,
  createQueue,
  fetchUsersQtd,
  createUserQueue,
  updateUserChannel,
} from "../../utils/db";
import { MessageEmbed } from "discord.js";

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
    const qtdQueue = await fetchUsers();
    await createQueue(channel.id, interaction.guildId);

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        "❌❌ You don't have the permissions to use this command! ❌❌"
      );
    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      if (channel.type === "GUILD_VOICE") {
        if (qtdQueue.length >= qtdPlayers) {
          await fetchUsersQtd(qtdPlayers).then((data) => {
            data.map((p) => {
              const member = interaction.guild.members.cache.get(p.user_id);
              updateInMatch(p.user_id, true);
              updateUserChannel(p.user_id, channel.id);
              createUserQueue(p.user_id, channel.id, channel.name);
              member.voice
                .setChannel(channel.id)
                .catch((err) => console.error(err));
            });
          });
          interaction.followUp({
            content: `${channel.name} Started!`,
            embeds: [],
            components: [],
            ephemeral: true,
          });
        } else {
          interaction.followUp({
            content: "Enough players in queue!",
            ephemeral: true,
          });
        }
      } else {
        interaction.editReply({
          content: "Not enough players in queue!",
          embeds: [],
          components: [],
        });
      }
    } else {
      interaction.editReply({
        embeds: [embed],
      });
      interaction.deferReply({
        ephemeral: true,
        fetchReply: true,
      });
    }
  },
});
