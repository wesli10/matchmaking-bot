import { Command } from "../../structures/Command";
import {
  fetchUsersInQueue,
  updateInMatch,
  createQueue,
  fetchUsersQtd,
  createUserQueue,
  updateUserChannel,
  fetchChannels,
  updateUserRole,
} from "../../utils/db";
import { MessageEmbed } from "discord.js";
import { embedEnoughPlayers, embedPermission } from "../../utils/embeds";

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
    const qtdQueue = await fetchUsersInQueue();
    const lobby = await fetchChannels(channel.id);
    await createQueue(channel.id, interaction.guildId);

    const embedStart = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("🎮 Match Started!")
      .setDescription(`${channel.name.toUpperCase()}`);

    const embedChannelInvalid = new MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Channel Invalid!")
      .setDescription(`${channel.name} is not a lobby channel!`);

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      if (channel.type === "GUILD_VOICE" && lobby.length != 0) {
        if (qtdQueue.length >= qtdPlayers) {
          await fetchUsersQtd(qtdPlayers).then((data) => {
            data.map((p) => {
              const member = interaction.guild.members.cache.get(p.user_id);
              setTimeout(
                () =>
                  member.roles
                    .add(lobby[0].role_id)
                    .catch((err) => console.log("não tem role pra tirar")),
                1000
              );
              setTimeout(
                () =>
                  member.voice
                    .setChannel(channel.id)
                    .catch((err) => console.log("usuario não está no canal")),
                1000
              );
              updateInMatch(p.user_id, true);
              updateUserChannel(p.user_id, channel.id);
              updateUserRole(p.user_id, lobby[0].role_id);
              createUserQueue(p.user_id, channel.id, channel.name);
            });
          });
          await interaction
            .followUp({
              content: `⠀`,
              components: [],
              embeds: [embedStart],
            })
            .catch((err) => console.error(err));
          setTimeout(() => interaction.deleteReply(), 3000);
        } else {
          await interaction
            .followUp({
              content: " ",
              embeds: [embedEnoughPlayers],
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
        .reply({
          embeds: [embedPermission],
        })
        .catch((err) => console.error(err));
      setTimeout(() => interaction.deleteReply(), 3000);
    }
  },
});
