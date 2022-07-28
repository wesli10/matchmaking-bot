import { TextChannel } from "discord.js";
import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";
import { clearQueue } from "../../utils/db";
import { DISCORD_CONFIG } from "../../configs/discord.config";

export default new Command({
  name: "fecharfila",
  description: "Close queue to players",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const role1 = DISCORD_CONFIG.roles.moderator;
    const role2 = DISCORD_CONFIG.roles.event;
    const role3 = DISCORD_CONFIG.roles.aux_event;
    const roleTeste = DISCORD_CONFIG.roles.admin;
    const admin = JSON.stringify(interaction.member.roles.valueOf());
    const queueRoom_id = DISCORD_CONFIG.channels.queue_room_id;

    const embedCloseQueue = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Fila Fechada!")
      .setDescription(
        "As filas estão fechada no momento, tente novamente em outro horário!"
      );

    if (
      interaction.memberPermissions.has("ADMINISTRATOR") ||
      interaction.user.id === DISCORD_CONFIG.mockAdminId
    ) {
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
