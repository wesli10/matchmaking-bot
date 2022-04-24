import { Command } from "../../structures/Command";
import { clear } from "../../utils/utils";
import { MessageEmbed } from "discord.js";
import { fetchUserInMatch, removeUser, updateInMatch } from "../../utils/db";
import { WAITINGROOM } from "../config/setWaitingRoom";

export default new Command({
  name: "endmatch",
  description: "Remove tags and move out user from lobby room",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    {
      name: "lobby",
      description: "The channel to endmatch",
      type: "CHANNEL",
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const channel = interaction.options.getChannel("lobby");
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        "❌❌ You don't have the permissions to use this command! ❌❌"
      );

    const embedEndMatch = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle(`${channel.name}`)
      .setDescription("Thanks for playing!");

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      if (channel.type === "GUILD_VOICE") {
        await fetchUserInMatch(channel.id).then((data) => {
          data.map((p) => {
            const member = interaction.guild.members.cache.get(p.user_id);
            updateInMatch(p.user_id, false);
            removeUser(p.user_id);
            member.voice
              .setChannel(WAITINGROOM)
              .catch((err) => console.error(err));
          });
        });
        interaction.editReply({
          embeds: [embedEndMatch],
        });
      } else {
        interaction.editReply({
          content: "Channel Invalid!",
          embeds: [],
          components: [],
        });
      }
    } else {
      interaction.editReply({
        embeds: [embed],
      });
    }
  },
});
