import { DISCORD_CONFIG } from "../../configs/discord.config";
import { Command } from "../../structures/Command";
import { resetQueue } from "../../utils/db";
import { embedPermission } from "../../utils/embeds";

const { roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;
const role_event = roles.event;
const role_moderator = roles.moderator;
const role_admin = roles.admin;

export default new Command({
  name: "resetarfila",
  description: "Remove todos os usuario da fila",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      !admin.includes(role_aux_event) &&
      !admin.includes(role_event) &&
      !admin.includes(role_moderator) &&
      !admin.includes(role_admin)
    ) {
      interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }
    resetQueue("queue_lol", interaction.guildId);
    interaction.deleteReply();
  },
});
