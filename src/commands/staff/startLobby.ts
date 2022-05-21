import { Command } from "../../structures/Command";
import {
  MessageEmbed,
  ButtonInteraction,
  Message,
  OverwriteResolvable,
  CacheType,
} from "discord.js";
import { embedPermission } from "../../utils/embeds";
import {
  create4v4Lobby,
  fetchCategory,
  removeUsersFromCategory,
  updateCategory,
  updateInMatch,
  updateModerator,
  updateUserTeam,
  updateWinnerAndFinishTime,
} from "../../utils/db";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { generateTeam } from "../../utils/4v4/generateTeam";
import {
  buttonCallMod,
  buttonFinishMatch,
  buttonFinishMatchDisabled,
  embedTime1,
  embedTime2,
  FinishLobby,
  PartidaCancelada,
  StartLobby,
} from "../../utils/4v4/messageInteractionsTemplates";
import { client } from "../..";

const { roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;
const role_event = roles.event;
const role_moderator = roles.moderator;
const role_admin = roles.admin;

export default new Command({
  name: "4v4",
  description: "start 4v4 match with player in queue",
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

    const players = await generateTeam(interaction.guildId);

    if (
      players.length < DISCORD_CONFIG.numbers.MIN_NUM_PLAYERS_TO_START_LOBBY
    ) {
      await interaction.editReply({
        content: "❌ Não há jogadores suficientes na fila.",
      });
      setTimeout(() => interaction.deleteReply(), 3000);
      return;
    }

    const permissions: OverwriteResolvable[] = [
      {
        id: interaction.guild.id,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: role_aux_event,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: role_event,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: role_moderator,
        allow: ["VIEW_CHANNEL"],
      },
      // {
      //   id: role_admin,
      //   allow: ["VIEW_CHANNEL"],
      // },
      // Add players permissions as well
      ...players.map((player) => {
        return {
          id: player.user_id,
          allow: ["VIEW_CHANNEL"],
          deny: ["SPEAK"],
        };
      }),
    ];

    console.log(permissions);

    // Create category
    const category = await interaction.guild.channels.create(
      `${interaction.user.username}`,
      {
        type: "GUILD_CATEGORY",
        permissionOverwrites: permissions,
      }
    );

    // Create Text Chat
    const textChat = await interaction.guild.channels.create("Chat", {
      type: "GUILD_TEXT",
      parent: category.id,
      permissionOverwrites: permissions,
    });

    // Voice chat
    await interaction.guild.channels.create("Voice chat", {
      type: "GUILD_VOICE",
      parent: category.id,
      permissionOverwrites: permissions,
    });

    for (const player of players) {
      await Promise.all([
        updateInMatch("users_4v4", player.user_id, true),
        updateUserTeam(player.user_id, player.team === 1 ? "Time1" : "Time 2"),
        updateCategory(player.user_id, category.id),
        updateModerator(player.user_id, interaction.user.id),
      ]);
    }

    await create4v4Lobby({
      players,
      category_id: category.id,
      moderator_id: interaction.user.id,
    });
    await textChat.send({
      content: `Time 1: <@${players
        .filter((player) => player.team === 1)
        .map((player) => player.user_id)
        .join(">, <@")}>`,
    });
    await textChat.send({
      content: `Time 2: <@${players
        .filter((player) => player.team === 2)
        .map((player) => player.user_id)
        .join(">, <@")}>`,
    });

    await textChat.send({
      embeds: [StartLobby],
      components: [buttonCallMod, buttonFinishMatch],
    });
    const collectorButton = interaction.channel.createMessageComponentCollector(
      {
        componentType: "BUTTON",
      }
    );

    collectorButton.on("end", (collectedButton) => {
      console.log(`Ended Collecting ${collectedButton.size} items`);
    });

    await interaction.deleteReply();
  },
});

async function deleteCategory(interaction: ButtonInteraction<CacheType>) {
  const channelId = interaction.channelId;
  const channel = await client.channels.fetch(channelId);

  try {
    if (channel.type !== "GUILD_TEXT") {
      throw new Error("Channel is not a text channel");
    }

    const parentCategory = await channel.parent;

    if (!parentCategory) {
      throw new Error("Channel has no parent");
    }

    await Promise.all(
      parentCategory.children.map((channel) => channel.delete())
    );
    parentCategory.delete();
  } catch (error) {
    console.log(error);
    await interaction.channel.send({
      content: "Ocorreu um erro ao deletar a categoria, Tente novamente!",
    });
    setTimeout(async () => await interaction.deleteReply(), 3000);
  }
}

export async function handleButtonInteractionPlayerMenu(
  btnInt: ButtonInteraction
) {
  const log = (...message: any[]) => {
    console.log(`[${btnInt.user.username}] --`, ...message);
  };

  const EMBEDCALLMOD = new MessageEmbed()
    .setColor("#fd4a5f")
    .setTitle("Chamando Mod")
    .setDescription(
      `⚠️ - Um <@&${role_aux_event}> foi notificado e está a caminho.\n\n jogador que fez o chamado: ${btnInt.user.tag}`
    );

  try {
    await btnInt.deferReply({
      ephemeral: false,
      fetchReply: false,
    });
    switch (btnInt.customId) {
      case "call_mod":
        log("Iniciando ação do botão", btnInt.customId);

        await btnInt.deleteReply(); // delete thinking message

        await btnInt.channel.send({
          content: `<@&${role_aux_event}>`,
          embeds: [EMBEDCALLMOD],
        });

        break;
      case "finish_match":
        log("Iniciando ação do botão", btnInt.customId);

        const channel = await btnInt.channel.fetch();

        await channel.messages.edit(btnInt.message.id, {
          embeds: [StartLobby],
          components: [buttonCallMod, buttonFinishMatchDisabled],
        });

        await btnInt.deleteReply(); // delete thinking message

        // display menu
        const data = await fetchCategory(btnInt.user.id);
        const category_id = data[0].category_id;

        const sendMessage = await btnInt.channel.send({
          embeds: [FinishLobby],
        });
        await sendMessage.react("1️⃣");
        await sendMessage.react("2️⃣");
        await sendMessage.react("❌");
        const collectorReaction = sendMessage.createReactionCollector({});
        if (!data[0].category_id) {
          try {
            await btnInt.channel.send("Ocorreu um erro, Tente novamente!");
          } catch (error) {
            console.log(error);
          }
          return;
        }
        let winnerTeam = "";
        collectorReaction.on("collect", async (reaction, user) => {
          const { MIN_REACTION_TO_VOTE_END_MATCH } = DISCORD_CONFIG.numbers;

          if (reaction.emoji.name === "1️⃣" && !user.bot) {
            if (reaction.count === MIN_REACTION_TO_VOTE_END_MATCH) {
              winnerTeam = "Time 1";

              const messageTime1 = await btnInt.channel.send({
                content: `<@&${role_aux_event}>`,
                embeds: [embedTime1],
              });

              messageTime1.react("✅");
              messageTime1.react("🛑");

              const collectorWinner1 = messageTime1.createReactionCollector({});

              collectorWinner1.on("collect", async (reaction, user) => {
                const member = await btnInt.guild.members.fetch(user.id);
                if (
                  reaction.emoji.name === "✅" &&
                  !user.bot &&
                  member.permissions.has("MODERATE_MEMBERS")
                ) {
                  try {
                    collectorReaction.stop();
                  } catch (error) {
                    console.log(error);
                  }
                } else if (
                  reaction.emoji.name === "🛑" &&
                  !user.bot &&
                  member.permissions.has("MODERATE_MEMBERS")
                ) {
                  try {
                    await messageTime1.delete();
                  } catch (error) {
                    console.log(error);
                  }
                }
              });
            }
          } else if (reaction.emoji.name === "2️⃣" && !user.bot) {
            if (reaction.count === MIN_REACTION_TO_VOTE_END_MATCH) {
              winnerTeam = "Time 2";

              const messageTime2 = await btnInt.channel.send({
                content: `<@&${role_aux_event}>`,
                embeds: [embedTime2],
              });

              messageTime2.react("✅");
              messageTime2.react("🛑");

              const collectorWinner2 = messageTime2.createReactionCollector({});

              collectorWinner2.on("collect", async (reaction, user) => {
                const member = await btnInt.guild.members.fetch(user.id);

                if (
                  reaction.emoji.name === "✅" &&
                  !user.bot &&
                  member.permissions.has("MODERATE_MEMBERS")
                ) {
                  try {
                    collectorReaction.stop();
                  } catch (error) {
                    console.log(
                      "error when stopping winenr2 collector =",
                      error
                    );
                  }
                } else if (
                  reaction.emoji.name === "🛑" &&
                  !user.bot &&
                  member.permissions.has("MODERATE_MEMBERS")
                ) {
                  try {
                    await messageTime2.delete();
                  } catch (error) {
                    console.log(
                      "error when deleting message for team2=",
                      error
                    );
                  }
                }
              });
            }
          } else if (
            reaction.emoji.name === "❌" &&
            !user.bot &&
            btnInt.memberPermissions.has("MODERATE_MEMBERS")
          ) {
            await sendMessage.delete();
            await btnInt.channel.send({
              embeds: [PartidaCancelada],
            });
            collectorReaction.stop();
          }
        });

        collectorReaction.on("end", async (collected) => {
          console.log(`Collected ${collected.size} items`);
          await removeUsersFromCategory(category_id);
          await updateWinnerAndFinishTime(winnerTeam, category_id);
          try {
            setTimeout(() => deleteCategory(btnInt), 3000);
          } catch (error) {
            console.log("error when deleting category=", error);
          }
        });
        break;
    }
  } catch (error) {
    log("Error!", error);

    await btnInt.editReply({
      content: "⚠️ Encontramos um error, tente novamente.",
      components: [],
    });
  }
}
