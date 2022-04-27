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
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const roleTeste = "965501155016835085";
    const admin = JSON.stringify(interaction.member.roles.valueOf());
    await createQueue(channel.id, interaction.guildId);

    const embedStart = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Partida Iniciada!")
      .setDescription(`Para kickar um jogador, utilize /ffkick \n
      Para finalizar a partida, utilize /endmatch`);

    const embedChannelInvalid = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Canal Invalido!")
      .setDescription(`Você está tentando iniciar a partida em uma sala que não está registrada como Lobby.\n
      Vá para um Lobby e tente novamente.`);

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      if (channel.type === "GUILD_STAGE_VOICE" && lobby.length != 0) {
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
