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

    if (interaction.memberPermissions.has("KICK_MEMBERS")) {
      const member = interaction.guild.members.cache.get(user.id);
      const player = await fetchUser(user.id);
      console.log(player);

      member.roles.remove(player[0].role_id).catch((err) => console.log(err));
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
    }
  },
});
