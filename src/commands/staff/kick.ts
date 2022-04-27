import { Command } from "../../structures/Command";
import { fetchUser, removeUser } from "../../utils/db";

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

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      const member = interaction.guild.members.cache.get(user.id);
      const player = await fetchUser(user.id);

      member.voice
        .disconnect()
        .then(() => {
          interaction.editReply({
            content: `${user.username.toUpperCase} was kicked from lobby!`,
            embeds: [],
            components: [],
          });
          removeUser(user.id);
          setTimeout(() => interaction.deleteReply(), 7000);
        })
        .catch((err) => {
          console.error(err);
        });
      try {
        member.roles.remove(player[0].role_id);
      } catch (err) {
        console.error(err);
      }
    }
  },
});
