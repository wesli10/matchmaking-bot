import { MessageEmbed } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { client } from "..";

export const verifyRole = (interaction) => {
  const guild = client.guilds.cache.get(process.env.DISCORD_VERIFIED_GUILD);

  if (!guild) {
    return;
  }

  const member = guild.members.cache.get(interaction.user.id);
  const hasRole = member.roles.cache.has(process.env.DISCORD_VERIFIED_ROLE_ID);

  if (hasRole) return false;

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
