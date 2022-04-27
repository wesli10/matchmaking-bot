import { Command } from "../../structures/Command";
import { DiscordAPIError, MessageEmbed } from "discord.js";
import { embedPermission } from "../../utils/embeds";

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
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const roleTeste = "965501155016835085";
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      if (channel.type === "GUILD_VOICE") {
        WAITINGROOM = channel.id;
        await interaction.followUp({
          content: `${channel.name} set as waiting room!`,
          embeds: [],
          components: [],
          ephemeral: true,
        });
      } else {
        await interaction.followUp({
          content: "Channel Invalid!",
          embeds: [],
          components: [],
          ephemeral: true,
        });
      }
    } else {
      await interaction.editReply({
        embeds: [embedPermission],
      });
    }
  },
});
