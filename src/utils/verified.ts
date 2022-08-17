import { MessageEmbed } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { client } from "..";

export const verifyRole = async (interaction) => {
  const verifiedGuild = process.env.DISCORD_VERIFIED_GUILD;
  const verifielRole = process.env.DISCORD_VERIFIED_ROLE_ID;
  const playerRoleId = process.env.DISCORD_PLAYER_ROLE_ID;

  const guild = client.guilds.cache.get(verifiedGuild);

  if (!guild) {
    console.log("No guild found");
    return;
  }

  const member = guild.members.cache.get(interaction.user.id);
  const hasRole = member.roles?.cache.has(verifielRole);

  if (hasRole) {
    try {
      const guildInHouse = client.guilds.cache.get(interaction.guildId);
      const memberInHouse = guildInHouse.members.cache.get(interaction.user.id);

      await memberInHouse.roles.add(playerRoleId);
    } catch (error) {
      console.log(error);
    }
    return;
  }

  interaction.reply({
    embeds: [messageVerified],
    components: [],
    ephemeral: true,
  });
  return true;
};

const messageVerified = new MessageEmbed()
  .setColor("#f1c40f")
  .setTitle("Você não possui o cargo de Verificado!")
  .setDescription(
    "Para entrar na fila, e utilizar corretamente esse servidor você precisa ter o cargo de Verificado" +
      " no servidor oficial da SNACKCLUB " +
      process.env.DISCORD_LINK_SNACKCLUB
  );
