import { Command } from "../../structures/Command";
import { fetchUser, removeUser } from "../../utils/db";
import { MessageEmbed, TextChannel } from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { embedPermission } from "../../utils/embeds";

const { roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;
const role_event = roles.event;
const role_moderator = roles.moderator;
const role_admin = roles.admin;

export default new Command({
  name: "ffkick",
  description: "Kick a user queue",
  userPermissions: ["KICK_MEMBERS"],
  options: [
    {
      name: "user",
      description: "The user to kick",
      type: "USER",
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const user = interaction.options.getUser("user");
    const kick_embed = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Expulso!")
      .setDescription(`Usuario: ${user.tag} foi expulso!`);
    const member = await interaction.guild.members.fetch(user.id);
    const admin = JSON.stringify(interaction.member.roles.valueOf());
    const waiting_room_id = DISCORD_CONFIG.channels.waiting_room_id;
    if (
      !admin.includes(role_aux_event) &&
      !admin.includes(role_event) &&
      !admin.includes(role_moderator) &&
      !admin.includes(role_admin)
    ) {
      interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }
    try {
      // Move usuario de sala
      await member.voice
        .setChannel(waiting_room_id)
        .catch((error) => console.log(error));

      // Remove usuario da fila
      removeUser("users_4v4", user.id);

      // Delete a thinking Message
      interaction.deleteReply();

      // Envia mensagem de usuario expulso
      const channel = interaction.guild.channels.cache.get(
        interaction.channelId
      ) as TextChannel;
      await channel.send({
        embeds: [kick_embed],
      });
    } catch (error) {
      console.log(error);
    }
  },
});
