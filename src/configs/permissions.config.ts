import { OverwriteResolvable } from "discord.js";
import { DISCORD_CONFIG } from "./discord.config";

const { roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;
const role_event = roles.event;
const role_moderator = roles.moderator;
const role_admin = roles.admin;

const PERMISSIONS_PRD: OverwriteResolvable[] = [
  {
    id: role_aux_event,
    allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS"],
  },
  {
    id: role_event,
    allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS"],
  },
  {
    id: role_moderator,
    allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS"],
  },
  {
    id: role_admin,
    allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS"],
  },
];

const PERMISSIONS_DEV: OverwriteResolvable[] = [
  {
    id: role_admin,
    allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS"],
  },
];

export const getPermissions = (interaction): OverwriteResolvable[] => {
  const permissions =
    process.env.NODE_ENV === "production"
      ? Object.assign(PERMISSIONS_PRD)
      : Object.assign(PERMISSIONS_DEV);

  permissions.push({
    id: interaction.guild.id,
    deny: ["VIEW_CHANNEL"],
  });

  return permissions;
};
