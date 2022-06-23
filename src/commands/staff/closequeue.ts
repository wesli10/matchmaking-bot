import { TextChannel } from "discord.js";
import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";
import { clearQueue } from "../../utils/db";
import { clear } from "../../utils/utils";

export default new Command({
  name: "fecharfila",
  description: "Close queue to players",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const role1 = process.env.DISCORD_ROLE_MODERATOR;
    const role2 = process.env.DISCORD_ROLE_EVENT;
    const role3 = process.env.DISCORD_ROLE_AUX_EVENT;
    const roleTeste = process.env.DISCORD_ROLE_ADMIN;
    const admin = JSON.stringify(interaction.member.roles.valueOf());
    const queueRoom_id = process.env.DISCORD_CHANNEL_QUEUE_ROOM;

    const embedCloseQueue = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Fila Fechada!")
      .setDescription(
        "As filas estão fechada no momento, tente novamente em outro horário!"
      );

    if (
      interaction.memberPermissions.has("ADMINISTRATOR") ||
      interaction.user.id === process.env.DISCORD_MOCK_ADMIN_ID
    ) {
      clear(interaction);
      interaction
        .followUp({
          content: "⠀",
        })
        .then(() => interaction.deleteReply());

      const channel = interaction.guild.channels.cache.get(
        queueRoom_id
      ) as TextChannel;

      channel.send({
        content: "⠀",
        embeds: [embedCloseQueue],
      });
      clearQueue();
    }
  },
});
