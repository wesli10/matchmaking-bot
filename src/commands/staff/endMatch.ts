import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";
import {
  createUserQueue,
  fetchUserInMatch,
  removeUser,
  fetchChannels,
} from "../../utils/db";
import { embedPermission } from "../../utils/embeds";

export default new Command({
  name: "end",
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
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const waiting_room_id = "968933862606503986";
    const roleTeste = "965501155016835085";
    const lobby = await fetchChannels(channel.id);
    const channelMod = interaction.channelId;
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    const embedEndMatch = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle(`${channel.name} - Partida Encerrada`)
      .setDescription(
        `Essa partida foi encerrada. Todos os jogadores foram registrados em meu banco de dados, e removidos da call.\n\n
        Para chamar mais jogadores na fila, digite /startmatch `
      );

    const embedChannelInvalid = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Channel Invalid!")
      .setDescription(`${channel.name} is not a lobby channel!`);

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      if (
        channel.type === "GUILD_VOICE" ||
        channel.type === "GUILD_STAGE_VOICE"
      ) {
        if (lobby.length != 0 && lobby[0].text_channel_id == channelMod) {
          await fetchUserInMatch(channel.id).then((data) => {
            data.map((p) => {
              const member = interaction.guild.members.cache.get(p.user_id);
              createUserQueue(
                p.user_id,
                channel.id,
                channel.name,
                interaction.user.id
              );
              removeUser(p.user_id);

              // MOVE DE SALA
              setTimeout(
                () =>
                  member.voice
                    .setChannel(waiting_room_id)
                    .catch((err) => console.error(err)),
                1000
              );

              // REMOVE CARGO
              setTimeout(
                () =>
                  member.roles
                    .remove(p.role_id)
                    .catch((err) => console.error(err)),
                1000
              );
            });
          });
          await interaction
            .followUp({
              embeds: [embedEndMatch],
            })
            .catch((err) => console.error(err));
          setTimeout(() => interaction.deleteReply(), 3000);
        } else {
          await interaction
            .editReply({
              content: "⠀",
              embeds: [embedChannelInvalid],
              components: [],
            })
            .catch((err) => console.error(err));
          setTimeout(() => interaction.deleteReply(), 3000);
        }
      } else {
        await interaction
          .editReply({
            content: "⠀",
            embeds: [embedChannelInvalid],
            components: [],
          })
          .catch((err) => console.error(err));
        setTimeout(() => interaction.deleteReply(), 3000);
      }
    } else {
      await interaction
        .editReply({
          embeds: [embedPermission],
        })
        .catch((err) => console.error(err));
      setTimeout(() => interaction.deleteReply(), 3000);
    }
  },
});
