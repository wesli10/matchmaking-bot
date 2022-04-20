import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";

export default new Command({
  name: "startqueue",
  description: "Open channel for queue",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {},
});
