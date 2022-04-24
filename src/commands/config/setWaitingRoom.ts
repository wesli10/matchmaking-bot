import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";

export let WAITINGROOM = "";

export default new Command({
  name: "waitingroom",
  description: "Set the waiting room channel",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    {
      name: "channel",
      description: "The channel to set",
      type: "CHANNEL",
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const channel = interaction.options.getChannel("channel");
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Insuficient Permissions!")
      .setDescription(
        "❌❌ You don't have the permissions to use this command! ❌❌"
      );

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      if (channel.type === "GUILD_VOICE") {
        WAITINGROOM = channel.id;
        interaction.followUp({
          content: `${channel.name} set as waiting room!`,
          embeds: [],
          components: [],
          ephemeral: true,
        });
      } else {
        interaction.followUp({
          content: "Channel Invalid!",
          embeds: [],
          components: [],
          ephemeral: true,
        });
      }
    } else {
      interaction.editReply({
        embeds: [embed],
      });
    }
  },
});
