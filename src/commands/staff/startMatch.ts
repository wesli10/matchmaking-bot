import { Command } from "../../structures/Command";
import {
  fetchUsersInQueue,
  updateInMatch,
  fetchUsersQtd,
  updateUserChannel,
  createUserQueue,
  fetchChannels,
  updateUserRole,
} from "../../utils/db";
import { MessageEmbed } from "discord.js";
import { embedEnoughPlayers, embedPermission } from "../../utils/embeds";

export default new Command({
  name: "start",
  description: "Give role to each player in queue and start the match",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    {
      name: "jogadores",
      description: "Number of players in the match",
      type: "NUMBER",
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const embedWrongChannel = new MessageEmbed()
      .setTitle("Negativo!")
      .setColor("#fd4a5f")
      .setDescription("Este Canal não pode receber comandos!");

    const qtdPlayers = interaction.options.getNumber("jogadores");
    const channelMod_id = interaction.channelId;
    const channelmod = interaction.guild.channels.cache.get(channelMod_id);
    const qtdQueue = await fetchUsersInQueue();
    const lobby = await fetchChannels(channelMod_id);
    if (!lobby[0]) {
      await interaction.editReply({
        content: "⠀",
        embeds: [embedWrongChannel],
      });
      setTimeout(() => interaction.deleteReply(), 3000);

      return;
    }
    const lobbyChannel = interaction.guild.channels.cache.get(
      lobby[0].channel_id
    );
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const roleTeste = "965501155016835085";
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    const embedStart = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle(`Partida Iniciada com ${qtdPlayers} jogadores!`)
      .setDescription(`Para kickar um jogador, utilize /ffkick \n
      Para finalizar a partida, utilize /end`);

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
      if (
        lobbyChannel.type === "GUILD_STAGE_VOICE" ||
        lobbyChannel.type === "GUILD_VOICE"
      ) {
        if (lobby.length != 0 && lobby[0].text_channel_id == channelMod_id) {
          if (qtdQueue.length >= qtdPlayers) {
            const users = await fetchUsersQtd("users", qtdPlayers);
            for (const user of users) {
              try {
                const member = await interaction.guild.members.fetch(
                  user.user_id
                );
                await createUserQueue(
                  user.user_id,
                  lobbyChannel.id,
                  lobbyChannel.name,
                  interaction.user.id,
                  interaction.guildId
                )
                  .then(() => console.log("Criando"))
                  .catch((err) => console.log(err));

                // ADICIONA CARGO
                await member.roles
                  .add(lobby[0].role_id)
                  .catch((err) => console.log("não tem role pra adicionar")),
                  // MOVE DE SALA
                  await member.voice
                    .setChannel(lobbyChannel.id)
                    .catch((err) => console.log("usuario não está no canal")),
                  await updateInMatch("users", user.user_id, true);
                await updateUserChannel(user.user_id, lobbyChannel.id);
                await updateUserRole(user.user_id, lobby[0].role_id);
              } catch (error) {
                console.log(error);
              }
            }
            await interaction
              .followUp({
                content: `⠀`,
                components: [],
                embeds: [embedStart],
              })
              .catch((err) => console.error(err));
          } else {
            await interaction
              .followUp({
                content: " ",
                embeds: [embedEnoughPlayers],
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
          .reply({
            content: "⠀",
            embeds: [embedChannelInvalid],
            components: [],
          })
          .catch((err) => console.error(err));
        setTimeout(() => interaction.deleteReply(), 5000);
      }
    } else {
      await interaction
        .reply({
          embeds: [embedPermission],
          ephemeral: true,
        })
        .catch((err) => console.error(err));
      setTimeout(() => interaction.deleteReply(), 5000);
    }
  },
});
