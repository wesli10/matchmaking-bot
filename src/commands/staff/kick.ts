import { Command } from "../../structures/Command";
import { fetchUser, removeUser } from "../../utils/db";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: "ffkick",
  description: "Kick a user from the server",
  userPermissions: ["KICK_MEMBERS"],
  options: [
    {
      name: "user",
      description: "The user to kick",
      type: "USER",
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const user = interaction.options.getUser("user");
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const roleTeste = "965501155016835085";
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    const embedKick = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle(`${user.username.toUpperCase()} foi kickado!`);

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      const member = await interaction.guild.members.fetch(user.id);
      const player = await fetchUser(user.id);
      if (!player[0]) {
        await interaction.editReply({
          content: "Não encontramos o usuário",
        });

        return;
      }
      try {
        await member.voice.disconnect().then(async () => {
          await interaction.editReply({
            content: `⠀`,
            embeds: [embedKick],
            components: [],
          });
          await removeUser("users", user.id);
        });
        await member.roles.remove(player[0].role_id);
      } catch (error) {
        console.log(error);
      }
    }
  },
});
