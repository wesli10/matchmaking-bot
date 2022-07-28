import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";
import { fetchUserInMatch, removeUser, fetchChannels } from "../../utils/db";
import { embedPermission } from "../../utils/embeds";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { emitSentry } from "../..";

export default new Command({
  name: "end",
  description: "Remove tags and move out user from lobby room",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const role1 = DISCORD_CONFIG.roles.moderator;
    const role2 = DISCORD_CONFIG.roles.event;
    const role3 = DISCORD_CONFIG.roles.aux_event;
    const roleTeste = DISCORD_CONFIG.roles.admin;
    const waiting_room_id = DISCORD_CONFIG.channels.waiting_room_id;
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      const channelMod_id = interaction.channelId;
      const lobby = await fetchChannels(channelMod_id);
      if (!lobby[0]) {
        await interaction.editReply({
          content: "⠀!",
          embeds: [embedPermission],
        });
        setTimeout(() => interaction.deleteReply(), 3000);

        return;
      }
      const lobbyChannel = interaction.guild.channels.cache.get(
        lobby[0].channel_id
      );
      const channelMod = interaction.guild.channels.cache.get(channelMod_id);
      const embedEndMatch = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle(`${lobbyChannel.name} - Partida Encerrada`)
        .setDescription(
          `Essa partida foi encerrada. Todos os jogadores foram registrados em meu banco de dados, e removidos da call.\n\n
      Para chamar mais jogadores na fila, digite /start `
        );
      const embedChannelInvalid = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle("Channel Invalid!")
        .setDescription(`${lobbyChannel.name} is not a lobby channel!`);

      if (
        lobbyChannel.type === "GUILD_VOICE" ||
        lobbyChannel.type === "GUILD_STAGE_VOICE"
      ) {
        if (lobby.length != 0 && lobby[0].text_channel_id == channelMod_id) {
          const users = await fetchUserInMatch(lobbyChannel.id);
          for (const user of users) {
            try {
              const member = await interaction.guild.members.fetch(
                user.user_id
              );

              // MOVE DE SALA
              await member.voice
                .setChannel(waiting_room_id)
                .catch((err) => "usuario não está na sala"),
                // REMOVE CARGO
                await member.roles
                  .remove(user.role_id)
                  .catch((err) => "Não conseguiu remover o cargo"),
                await removeUser("users", user.user_id);
            } catch (error) {
              console.log(error);
              emitSentry("/end", "Tried to remove user from match", error);
            }
          }
          await interaction
            .followUp({
              embeds: [embedEndMatch],
            })
            .catch((err) => console.error(err));
        } else {
          await interaction
            .editReply({
              content: "⠀",
              embeds: [embedChannelInvalid],
              components: [],
            })
            .catch((err) => console.error(err));
          setTimeout(() => interaction.deleteReply(), 5000);
        }
      } else {
        await interaction
          .editReply({
            content: "⠀",
            embeds: [embedChannelInvalid],
            components: [],
          })
          .catch((err) => console.error(err));
        setTimeout(() => interaction.deleteReply(), 5000);
      }
    } else {
      await interaction
        .editReply({
          embeds: [embedPermission],
        })
        .catch((err) => console.error(err));
      setTimeout(() => interaction.deleteReply(), 5000);
    }
  },
});
