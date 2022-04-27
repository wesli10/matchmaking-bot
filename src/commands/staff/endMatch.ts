import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";
import { fetchUserInMatch, removeUser } from "../../utils/db";
import { WAITINGROOM } from "../config/setWaitingRoom";
import { embedPermission } from "../../utils/embeds";

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

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      if (channel.type === "GUILD_VOICE") {
        await fetchUserInMatch(channel.id).then((data) => {
          data.map((p) => {
            const member = interaction.guild.members.cache.get(p.user_id);
            removeUser(p.user_id);

            // MOVE DE SALA
            setTimeout(
              () =>
                member.voice
                  .setChannel(WAITINGROOM)
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
          embeds: [embedPermission],
        })
        .catch((err) => console.error(err));
      setTimeout(() => interaction.deleteReply(), 3000);
    }
  },
});
