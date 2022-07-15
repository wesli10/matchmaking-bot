import { MessageEmbed, OverwriteResolvable } from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { getPermissions } from "../../configs/permissions.config";
import { Command } from "../../structures/Command";
import { generateTeam5v5_lol } from "../../utils/5v5/generateTeam5v5_lol";
import { roles } from "../../utils/5v5/manageMatch";

export default new Command({
  name: "lol",
  description: "Generate a 5v5 lobby on valorant",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const players = await generateTeam5v5_lol(interaction.guildId);

    const roles_lol = roles;

    const channel = interaction.channel;
    if (channel.type !== "GUILD_TEXT") {
      return;
    }

    await interaction.deleteReply();
    //   const players = await generateTeam5v5_lol(interaction.guildId);
    //   if (players.length < DISCORD_CONFIG.numbers.MIN_NUM_PLAYERS_TO_5v5_MATCH) {
    //     await interaction.editReply({
    //       content: "❌ Não há jogadores suficientes na fila.",
    //     });
    //     setTimeout(() => interaction.deleteReply(), 3000);
    //     return;
    //   }

    //   await interaction.deleteReply(); // delete the thinking messag

    //   const permissions: OverwriteResolvable[] = [
    //     ...getPermissions(interaction),
    //     // Add players permissions as well
    //     ...players.map((player) => {
    //       return {
    //         id: player.user_id,
    //         allow: ["VIEW_CHANNEL"],
    //         deny: ["SPEAK"],
    //       };
    //     }),
    //   ];

    //   const permissionsTeam1: OverwriteResolvable[] = [
    //     ...getPermissions(interaction),
    //     // Add players permissions as well
    //     ...players
    //       .filter((player) => player.team === 1)
    //       .map((player) => {
    //         return {
    //           id: player.user_id,
    //           allow: ["VIEW_CHANNEL"],
    //           deny: ["SPEAK"],
    //         };
    //       }),
    //   ];

    //   const permissionsTeam2: OverwriteResolvable[] = [
    //     ...getPermissions(interaction),
    //     // Add players permissions as well
    //     ...players
    //       .filter((player) => player.team === 2)
    //       .map((player) => {
    //         return {
    //           id: player.user_id,
    //           allow: ["VIEW_CHANNEL"],
    //           deny: ["SPEAK"],
    //         };
    //       }),
    //   ];

    //   const permissionsAnnouncements: OverwriteResolvable[] = [
    //     ...getPermissions(interaction),
    //     // Add players permissions as well
    //     ...players.map((player) => {
    //       return {
    //         id: player.user_id,
    //         allow: ["VIEW_CHANNEL"],
    //         deny: ["SEND_MESSAGES"],
    //       };
    //     }),
    //   ];

    //   // Create category
    //   const category = await interaction.guild.channels.create(
    //     `${interaction.user.username}`,
    //     {
    //       type: "GUILD_CATEGORY",
    //       permissionOverwrites: permissions,
    //     }
    //   );

    //   // Create Text Chat
    //   const textChatAnnouncements = await interaction.guild.channels.create(
    //     "Informação",
    //     {
    //       type: "GUILD_TEXT",
    //       parent: category.id,
    //       permissionOverwrites: permissionsAnnouncements,
    //     }
    //   );

    //   // Create Voice Channel Team 1
    //   await interaction.guild.channels.create("Time 1", {
    //     type: "GUILD_VOICE",
    //     parent: category.id,
    //     permissionOverwrites: permissionsTeam1,
    //   });

    //   // Create Voice Channel Team 2
    //   await interaction.guild.channels.create("Time 2", {
    //     type: "GUILD_VOICE",
    //     parent: category.id,
    //     permissionOverwrites: permissionsTeam2,
    //   });
  },
});
