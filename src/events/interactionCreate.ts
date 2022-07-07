import { CommandInteractionOptionResolver, Message } from "discord.js";
import { client } from "..";
import { handleButtonInteractionPlayerMenu_valorant } from "../commands/staff/match";
import { handleButtonInteraction } from "../commands/staff/queue";
import { handleButtonInteraction_4v4 } from "../commands/staff/queue_lobby";
import { handleButtonInteractionPlayerMenu } from "../commands/staff/startLobby";
import { handleButtonInteractionQueue_valorant } from "../commands/staff/valorant_queue";
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
    } else if (
      interaction.customId === "enter_queue_4v4" ||
      interaction.customId === "leave_queue_4v4"
    ) {
      await handleButtonInteraction_4v4(interaction);
    } else if (
      interaction.customId === "call_mod" ||
      interaction.customId === "finish_match" ||
      interaction.customId === "confirm_finish_match"
    ) {
      await handleButtonInteractionPlayerMenu(interaction);
    } else if (
      interaction.customId === "enter_queue_valorant" ||
      interaction.customId === "leave_queue_valorant"
    ) {
      await handleButtonInteractionQueue_valorant(interaction);
    } else if (
      interaction.customId === "finish_match_valorant" ||
      interaction.customId === "confirm_finish_match_valorant" ||
      interaction.customId === "call_mod_valorant"
    ) {
      await handleButtonInteractionPlayerMenu_valorant(interaction);
    } else {
      console.warn("unknown button interaction", interaction.customId);
    }
  }
});
