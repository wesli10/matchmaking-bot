import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  TextChannel,
} from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { Command } from "../../structures/Command";
import {
  BUTTONS_lol,
  BUTTONS_valorant,
  StartQueue_lol,
  StartQueue_valorant,
} from "../../utils/5v5/messageInteractionsTemplates";
import { embedPermission } from "../../utils/embeds";
import { searchMatch_lol } from "../../utils/5v5/lol_queue";
import { searchMatch_valorant } from "../../utils/5v5/valorant_queue";

const choices = [
  {
    name: "Valorant",
    value: "VALORANT",
  },
  {
    name: "League of Legends",
    value: "LEAGUE_OF_LEGENDS",
  },
];
let queue_valorant: any = "";
let message_valorant: any = "";

let queue_lol: any = "";
let message_lol: any = "";

const { channels } = DISCORD_CONFIG;

export default new Command({
  name: "abrirfila",
  description: "Encerra a procura de partida do jogo escolhido",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    {
      name: "game",
      description: "Jogo",
      type: "STRING",
      required: true,
      choices,
    },
  ],

  run: async ({ interaction }) => {
    const game = interaction.options.getString("game");

    if (
      !interaction.memberPermissions.has("ADMINISTRATOR") &&
      interaction.user.id !== DISCORD_CONFIG.mockAdminId
    ) {
      await interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }

    switch (game) {
      case "LEAGUE_OF_LEGENDS":
        try {
          // delete thinking message
          await interaction.deleteReply();

          const channel = interaction.guild.channels.cache.get(
            channels.queue_room_id
          ) as TextChannel;

          const collector = interaction.channel.createMessageComponentCollector(
            {
              componentType: "BUTTON",
            }
          );

          collector.on("end", (collected) => {
            console.log(`Ended collecting ${collected.size} items`);
          });

          message_lol = await channel.send({
            embeds: [StartQueue_lol],
            components: [BUTTONS_lol],
          });

          const channelAnnouncement = interaction.guild.channels.cache.get(
            interaction.channel.id
          );
          if (channelAnnouncement.type !== "GUILD_TEXT") {
            return;
          }

          queue_lol = setInterval(
            () =>
              searchMatch_lol(
                interaction,
                interaction.guildId,
                channelAnnouncement
              ),
            15000
          );
        } catch (error) {
          console.log(error);
        }
        break;

      case "VALORANT":
        try {
          // delete thinking message
          await interaction.deleteReply();

          const channel = interaction.guild.channels.cache.get(
            channels.queue_room_id
          ) as TextChannel;

          const collector = interaction.channel.createMessageComponentCollector(
            {
              componentType: "BUTTON",
            }
          );

          collector.on("end", (collected) => {
            console.log(`Ended collecting ${collected.size} items`);
          });

          message_valorant = await channel.send({
            embeds: [StartQueue_valorant],
            components: [BUTTONS_valorant],
          });

          const channelAnnouncement = interaction.guild.channels.cache.get(
            interaction.channel.id
          );
          if (channelAnnouncement.type !== "GUILD_TEXT") {
            return;
          }

          queue_valorant = setInterval(
            () =>
              searchMatch_valorant(
                interaction,
                interaction.guildId,
                channelAnnouncement
              ),
            15000
          );
        } catch (error) {
          console.log(error);
        }
        break;
    }
  },
});

export async function takeOffQueue_valorant() {
  await message_valorant?.delete();

  return clearInterval(queue_valorant);
}

export async function takeOffQueue_lol() {
  await message_lol?.delete();

  return clearInterval(queue_lol);
}
