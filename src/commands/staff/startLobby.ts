import { Command } from "../../structures/Command";
import {
  MessageEmbed,
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  VoiceChannel,
  Interaction,
  TextChannel,
  Message,
} from "discord.js";
import { embedPermission } from "../../utils/embeds";
import {
  create4v4Lobby,
  fetchCategory,
  fetchUsersInMatch,
  fetchUsersQtd,
  removeUsersFromCategory,
  updateCategory,
  updateInMatch,
  updateModerator,
  updateUserTeam,
  updateWinnerAndFinishTime,
} from "../../utils/db";

const MIN_NUM_PLAYERS_TO_START_LOBBY = 8;
const MIN_REACTION_TO_VOTE_END_MATCH = 6;
const WAITING_ROOM_ID = "968933862606503986";

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
    `O time 1 foi declarado como vencedor!\n <@&${"968697582706651188"}>, reaja com ✅ abaixo para confirmar o resultado e finalizar o Lobby \n ou com 🛑 para resetar a votação. `
  );

const embedTime2 = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Vencedor da Partida")
  .setDescription(
    `O time 2 foi declarado como vencedor!\n <@&${"968697582706651188"}>, reaja com ✅ abaixo para confirmar o resultado e finalizar o Lobby \n ou com 🛑 para resetar a votação.`
  );

const players = new MessageEmbed().setColor("#fd4a5f");
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
const role1 = "945293155866148914";
const role2 = "958065673156841612";
const role3 = "968697582706651188";
const roleTeste = "965501155016835085";

let textMessage = null;

export default new Command({
  name: "4v4",
  description: "start 4v4 match with player in queue",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const qtd = MIN_NUM_PLAYERS_TO_START_LOBBY;
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
    const admin = JSON.stringify(interaction.member.roles.valueOf());

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
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

      players.forEach(async (player) => {
        try {
          await textChat.permissionOverwrites.create(player.user_id, {
            VIEW_CHANNEL: true,
          });
        } catch (error) {
          console.log(error);
        }
      });
      // Team 2 Acess to TextChat
      team2.forEach(async (player) => {
        try {
          await textChat.permissionOverwrites.create(player.user_id, {
            VIEW_CHANNEL: true,
          });
        } catch (error) {
          console.log(error);
        }
      });

      await create4v4Lobby(
        players.map((p) => p.user_id),
        players.map((p) => p.name),
        team2.map((p) => p.user_id),
        team2.map((p) => p.name),
        category.id,
        interaction.user.id
      );
      // VOICE CHANNEL 1
      const channel1 = (await interaction.guild.channels.create("Time 1", {
        type: "GUILD_VOICE",
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
      })) as VoiceChannel;
      for (const player of players) {
        try {
          const member = await interaction.guild.members.fetch(player.user_id);
          await channel1.permissionOverwrites.create(player.user_id, {
            VIEW_CHANNEL: true,
          });
          await updateUserTeam(player.user_id, "Time 1");
          await updateInMatch("users_4v4", player.user_id, true);
          await updateCategory(player.user_id, category.id);
          await updateModerator(player.user_id, interaction.user.id);
          await member.voice.setChannel(channel1.id);
        } catch (error) {
          console.log("Usuario não conectado");
        }
      }

      // VOICE CHANNEL 2
      const channel2 = (await interaction.guild.channels.create("Time 2", {
        type: "GUILD_VOICE",
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
      })) as VoiceChannel;
      for (const player of team2) {
        try {
          const member = await interaction.guild.members.fetch(player.user_id);
          await channel2.permissionOverwrites.create(player.user_id, {
            VIEW_CHANNEL: true,
          });
          await updateUserTeam(player.user_id, "Time 2");
          await updateInMatch("users_4v4", player.user_id, true);
          await updateCategory(player.user_id, category.id);
          await updateModerator(player.user_id, interaction.user.id);
          await member.voice.setChannel(channel2.id);
        } catch (error) {
          console.log("Usuario não conectado");
        }
      }
      textMessage = await textChat.send({
        embeds: [StartLobby],
        components: [buttonCallMod, buttonFinishMatch],
      });
      const collectorButton =
        interaction.channel.createMessageComponentCollector({
          componentType: "BUTTON",
        });

      collectorButton.on("end", (collectedButton) => {
        console.log(`Ended Collecting ${collectedButton.size} items`);
      });

      await interaction.deleteReply();
    } else {
      interaction.editReply({
        embeds: [embedPermission],
      });
    }
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
    if (!parent.id) {
      await btnInt.channel.send({
        content: "Ocorreu um erro ao deletar a categoria, Tente novamente!",
      });
      setTimeout(async () => await btnInt.deleteReply(), 3000);
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
      `⚠️ - Um <@&${"968697582706651188"}> foi notificado e está a caminho.\n\n jogador que fez o chamado: ${
        btnInt.user.tag
      }`
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
          content: `<@&${"968697582706651188"}>`,
          embeds: [EMBEDCALLMOD],
        });

        break;
      case "finish_match":
        log("Iniciando ação do botão", btnInt.customId);

        // await btnInt.editReply({
        //   embeds: [StartLobby],
        //   components: [buttonCallMod, buttonFinishMatchDisabled],
        // });

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
          await btnInt.channel.send("Ocorreu um erro, Tente novamente!");

          setTimeout(() => btnInt.deleteReply(), 3000);
          return;
        }
        var winnerTeam = "";
        collectorReaction.on("collect", async (reaction, user) => {
          if (reaction.emoji.name === "1️⃣" && !user.bot) {
            if (reaction.count >= MIN_REACTION_TO_VOTE_END_MATCH) {
              winnerTeam = "Time 1";
              const messageTime1 = await btnInt.channel.send({
                content: `<@&${"968697582706651188"}>`,
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
            if (reaction.count >= MIN_REACTION_TO_VOTE_END_MATCH) {
              winnerTeam = "Time 2";
              const messageTime2 = await btnInt.channel.send({
                content: `<@&${"968697582706651188"}>`,
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

        collectorReaction.on(
          "end",
          async (collected, interaction: Interaction) => {
            const users = await fetchUsersInMatch(category_id);
            for (const user of users) {
              try {
                const member = await interaction.guild.members.fetch(
                  user.user_id
                );
                await member.voice.setChannel(WAITING_ROOM_ID);
              } catch (error) {
                console.log("Usuario não conectado");
              }
            }
            try {
              console.log(`Collected ${collected.size} items`);
              await removeUsersFromCategory(category_id);
              await updateWinnerAndFinishTime(winnerTeam, category_id);
              setTimeout(() => deleteCategory(btnInt), 3000);
            } catch (error) {
              console.log(error);
            }
          }
        );
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
