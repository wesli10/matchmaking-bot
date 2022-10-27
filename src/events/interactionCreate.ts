import { CommandInteractionOptionResolver, Message } from "discord.js";
import { client, emitSentry } from "..";
import {
  handleButtonInteractionPlayerMenu_lol,
  handleButtonInteractionQueue_lol,
  handleSelectMenuInteraction,
} from "../utils/5v5/lol_queue";
import {
  handleButtonInteractionPlayerMenu_valorant,
  handleButtonInteractionQueue_valorant,
} from "../utils/5v5/valorant_queue";
import { Event } from "../structures/Event";
import { ExtendedInteraction } from "../typings/Command";
import { DISCORD_CONFIG } from "../configs/discord.config";
import { embedChannelInvalid } from "../utils/embeds";

const commands_channel_id = DISCORD_CONFIG.channels.commands_channel_id;

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

    if (interaction.channelId !== commands_channel_id) {
      const message = await interaction.channel.send({
        embeds: [embedChannelInvalid],
      });
      await interaction.deleteReply();
      setTimeout(async () => await message.delete(), 5000);
      return;
    }
    command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    });
  } else if (interaction.isButton()) {
    if (
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
    } else if (
      interaction.customId === "enter_queue_lol" ||
      interaction.customId === "leave_queue_lol"
    ) {
      await handleButtonInteractionQueue_lol(interaction);
    } else if (
      interaction.customId === "finish_match_lol" ||
      interaction.customId === "confirm_finish_match_lol" ||
      interaction.customId === "call_mod_lol"
    ) {
      await handleButtonInteractionPlayerMenu_lol(interaction);
    } else {
      console.warn("unknown button interaction", interaction.customId);
      emitSentry(
        "interactionCreateEvent",
        `buttonInteraction`,
        `unknown button interaction ${interaction.customId}`
      );
    }
  } else if (interaction.isSelectMenu()) {
    if (interaction.customId === "roles_lol") {
      await handleSelectMenuInteraction(interaction);
    }
  }
});
