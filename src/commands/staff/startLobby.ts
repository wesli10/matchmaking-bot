import { Command } from "../../structures/Command";
import {
  MessageEmbed,
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  TextChannel,
  Message,
} from "discord.js";
import { embedPermission } from "../../utils/embeds";
import {
  create4v4Lobby,
  fetchCategory,
  fetchUsersQtd,
  removeUsersFromCategory,
  updateCategory,
  updateInMatch,
  updateModerator,
  updateUserTeam,
  updateWinnerAndFinishTime,
} from "../../utils/db";
import { DISCORD_CONFIG } from "../../configs/discord.config";

function shuffleArray(arr) {
  // Loop em todos os elementos
  for (let i = arr.length - 1; i > 0; i--) {
    // Escolhendo elemento aleatório
    const j = Math.floor(Math.random() * (i + 1));
    // Reposicionando elemento
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Retornando array com aleatoriedade
  return arr;
}
const { roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;
const role_event = roles.event;
const role_moderator = roles.moderator;
const role_test = roles.admin;

const StartLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Começo de Lobby")
  .setDescription(
    "A sua sala premiada irá iniciar em instantes.\n Se encontrar problemas ou precisar reportar um jogador, utilize os controles do bot"
  );

const PartidaCancelada = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Partida Cancelada")
  .setDescription("A partida foi cancelada.");

const embedTime1 = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Vencedor da Partida")
  .setDescription(
    `O time 1 foi declarado como vencedor!\n <@&${role_aux_event}>, reaja com ✅ abaixo para confirmar o resultado e finalizar o Lobby \n ou com 🛑 para resetar a votação. `
  );

const embedTime2 = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Vencedor da Partida")
  .setDescription(
    `O time 2 foi declarado como vencedor!\n <@&${role_aux_event}>, reaja com ✅ abaixo para confirmar o resultado e finalizar o Lobby \n ou com 🛑 para resetar a votação.`
  );

const FinishLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("A partida foi finalizada!")
  .setDescription(
    "Clique na reação adequada para indicar qual time foi o vencedor.\n Se precisar, chame os organizadores."
  );
const buttonCallMod = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("call_mod")
    .setEmoji("📞")
    .setLabel("Chamar Mod")
    .setStyle("SUCCESS")
);
const buttonFinishMatch = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("finish_match")
    .setEmoji("🏁")
    .setLabel("Finalizar Partida")
    .setStyle("DANGER")
);

const buttonFinishMatchDisabled = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("finish_match")
    .setEmoji("🏁")
    .setLabel("Finalizar Partida")
    .setStyle("DANGER")
    .setDisabled(true)
);

let textMessage: Message = null;

export default new Command({
  name: "4v4",
  description: "start 4v4 match with player in queue",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const qtd = DISCORD_CONFIG.numbers.MIN_NUM_PLAYERS_TO_START_LOBBY;
    const dataAll = await fetchUsersQtd("users_4v4", qtd);
    const metade = qtd / 2;
    if (dataAll.length < qtd) {
      await interaction.editReply({
        content: "❌ Não há jogadores suficientes na fila.",
      });
      setTimeout(() => interaction.deleteReply(), 3000);
      return;
    }
    const players = shuffleArray(dataAll);
    const team2 = players.splice(0, metade);
    const team1 = players;
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      !admin.includes(role_aux_event) &&
      !admin.includes(role_event) &&
      !admin.includes(role_moderator) &&
      !admin.includes(role_test)
    ) {
      interaction
        .editReply({
          embeds: [embedPermission],
        })
        .then(() => setTimeout(() => interaction.deleteReply(), 3000));

      return;
    }

    const category = await interaction.guild.channels.create(
      `${interaction.user.username}`,
      {
        type: "GUILD_CATEGORY",
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: "945293155866148914",
            allow: ["VIEW_CHANNEL"],
          },
          {
            id: "958065673156841612",
            allow: ["VIEW_CHANNEL"],
          },
          {
            id: "968697582706651188",
            allow: "VIEW_CHANNEL",
          },
        ],
      }
    );

    // TEXT CHAT
    const textChat = (await interaction.guild.channels.create("Chat", {
      type: "GUILD_TEXT",
      parent: category.id,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ["VIEW_CHANNEL"],
        },
        {
          id: "945293155866148914",
          allow: ["VIEW_CHANNEL"],
        },
        {
          id: "958065673156841612",
          allow: ["VIEW_CHANNEL"],
        },
        {
          id: "968697582706651188",
          allow: "VIEW_CHANNEL",
        },
      ],
    })) as TextChannel;
    // Team 1 Acess to TextChat
    for (const player of team1) {
      try {
        await textChat.permissionOverwrites.create(player.user_id, {
          VIEW_CHANNEL: true,
        });
        await updateInMatch("users_4v4", player.user_id, true);
        await updateUserTeam(player.user_id, "Time 1");
        await updateCategory(player.user_id, category.id);
        await updateModerator(player.user_id, interaction.user.id);
      } catch (error) {
        console.log(error);
      }
    }
    // Team 2 Acess to TextChat
    for (const player of team2) {
      try {
        await textChat.permissionOverwrites.create(player.user_id, {
          VIEW_CHANNEL: true,
        });
        await updateInMatch("users_4v4", player.user_id, true);
        await updateUserTeam(player.user_id, "Time 2");
        await updateCategory(player.user_id, category.id);
        await updateModerator(player.user_id, interaction.user.id);
      } catch (error) {
        console.log(error);
      }
    }

    await create4v4Lobby(
      players.map((p) => p.user_id),
      players.map((p) => p.name),
      team2.map((p) => p.user_id),
      team2.map((p) => p.name),
      category.id,
      interaction.user.id
    );
    // textChat.send({
    //   content: `Time 1: <@${players
    //     .map((p) => p.user_id)
    //     .join(",")}> \n Time 2: <@${team2.map((p) => p.user_id).join(",")}>`,
    // });

    textMessage = await textChat.send({
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

export async function handleButtonInteractionPlayerMenu(
  btnInt: ButtonInteraction
) {
  const log = (...message: any[]) => {
    console.log(`[${btnInt.user.username}] --`, ...message);
  };
  async function deleteCategory(interaction) {
    const parent = interaction.message.channel.parent;
    if (!parent) {
      await btnInt.channel.send({
        content: "Ocorreu um erro ao deletar a categoria, Tente novamente!",
      });
      setTimeout(async () => await btnInt.deleteReply(), 3000);
      return;
    }

    const category = interaction.guild.channels.cache.get(parent.id);
    try {
      category.children.forEach((channel) => channel.delete());
      category.delete();
    } catch (error) {
      console.log(error);
    }
  }
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

        await btnInt.deleteReply(); // delete thinking message

        textMessage.edit({
          embeds: [StartLobby],
          components: [buttonCallMod, buttonFinishMatchDisabled],
        });

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
            setTimeout(() => btnInt.deleteReply(), 3000);
          } catch (error) {
            console.log(error);
          }
          return;
        }
        var winnerTeam = "";
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
                    console.log(error);
                  }
                } else if (
                  reaction.emoji.name === "🛑" &&
                  !user.bot &&
                  member.permissions.has("MODERATE_MEMBERS")
                ) {
                  try {
                    await messageTime2.delete();
                  } catch (error) {
                    console.log(error);
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
            console.log(error);
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
