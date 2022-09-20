import { MessageEmbed, TextChannel } from "discord.js";
import { emitSentry } from "../..";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { Command } from "../../structures/Command";
import { banUser, isBanned } from "../../utils/db";
import { embedPermission } from "../../utils/embeds";

export default new Command({
  name: "castigo",
  description: "Expulsa um usuario do servidor por determinadas horas.",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    { name: "user", description: "Usuario", type: "USER", required: true },
    {
      name: "hours",
      description: "Quantidade de horas",
      type: "NUMBER",
      required: true,
    },
    { name: "reason", description: "Motivo", type: "STRING", required: true },
  ],
  run: async ({ interaction }) => {
    if (
      !interaction.memberPermissions.has("ADMINISTRATOR") &&
      interaction.user.id !== DISCORD_CONFIG.mockAdminId
    ) {
      await interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }

    const user = interaction.options.getUser("user");
    const hours = interaction.options.getNumber("hours");
    const reason = interaction.options.getString("reason");

    const banned = await isBanned(user.id);

    if (banned) {
      interaction
        .editReply({
          embeds: [
            new MessageEmbed()
              .setColor("#ff0000")
              .setTitle("Usuario já está banido!")
              .setDescription(`O usuario ${user.tag} já está banido!`),
          ],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }

    try {
      const end_date = new Date();
      end_date.setHours(end_date.getHours() + hours);

      await banUser(user.id, end_date, reason, interaction.user.id);

      const kick_embed = new MessageEmbed()
        .setColor("#fd4a5f")
        .setTitle("Banido!")
        .setDescription(
          `Usuario: ${user.tag} foi banido por ${hours} hora(s)!`
        );

      const channel = interaction.guild.channels.cache.get(
        interaction.channelId
      ) as TextChannel;

      const interactionMessage = await channel.send({
        embeds: [kick_embed],
      });

      setTimeout(() => interactionMessage.delete(), 3000);

      await interaction.deleteReply();
    } catch (error) {
      console.log(error);
      emitSentry("/banir", "Tried to ban user for a specific time", error);
    }
  },
});
