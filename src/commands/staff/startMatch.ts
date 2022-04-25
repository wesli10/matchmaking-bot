import { Command } from "../../structures/Command";
import {
  fetchUsersInQueue,
  updateInMatch,
  createQueue,
  fetchUsersQtd,
  createUserQueue,
  updateUserChannel,
  createUser,
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
    // const qtdQueue = await fetchUsersInQueue();
    const qtdQueue = players.length;
    await createQueue(channel.id, interaction.guildId);
    interaction.ephemeral = true;

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        "❌❌ You don't have the permissions to use this command! ❌❌"
      );
    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      if (channel.type === "GUILD_VOICE") {
        if (qtdQueue >= qtdPlayers) {
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
          await interaction.followUp({
            content: "Match started!",
            components: [],
            ephemeral: true,
          });
        } else {
          await interaction.followUp({
            content: "Enough players in queue!",
            ephemeral: true,
          });
        }
      } else {
        await interaction.followUp({
          content: "Channel Invalid!",
          embeds: [],
          components: [],
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        embeds: [embed],
      });
    }
  },
});
