import { Command } from "../../structures/Command";

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

      member.roles.remove("966101988045623357");
      member.voice
        .disconnect()
        .then(() => {
          interaction.editReply({
            content: `${user.username} was kicked from lobby!`,
            embeds: [],
            components: [],
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  },
});
