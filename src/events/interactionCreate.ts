import { CommandInteractionOptionResolver, Message } from "discord.js";
import { client } from "..";
import { handleButtonInteraction } from "../commands/staff/queue";
import { Event } from "../structures/Event";
import { ExtendedInteraction } from "../typings/Command";

export default new Event("interactionCreate", async (interaction) => {
  // Chat input Commands
  if (interaction.isCommand()) {
    await interaction.deferReply({
      ephemeral: false,
      fetchReply: true,
    });
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.followUp("You have used a non existent command");

    command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    });
  } else if (interaction.isButton()) {
    if (
      interaction.customId === "enter_queue" ||
      interaction.customId === "leave_queue"
    ) {
      await handleButtonInteraction(interaction);
    } else {
      console.warn("unknown button interaction", interaction.customId);
    }
  }
});
