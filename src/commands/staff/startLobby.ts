import { Command } from "../../structures/Command";
import {
  MessageEmbed,
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  VoiceChannel,
  Interaction,
} from "discord.js";
import { embedPermission } from "../../utils/embeds";
import {
  create4v4Lobby,
  fetchCategory,
  fetchUsersInMatch,
  fetchUsersQtd,
  removeUser,
  removeUsersFromCategory,
  updateCategory,
  updateInMatch,
  updateModerator,
  updateUserTeam,
  updateWinnerAndFinishTime,
} from "../../utils/db";

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
const waiting_room_id = "968933862606503986";

const StartLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Começo de Lobby")
  .setDescription(
    "A sua sala premiada irá iniciar em instantes.\n Se encontrar problemas ou precisar reportar um jogador, utilize os controles do bot"
  );

const FinishLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("A partida foi finalizada!")
  .setDescription(
    "Clique na reação adequada para indicar qual time foi o vencedor.\n Se precisar, chame os organizadores."
  );
const BUTTONS = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("call_mod")
    .setEmoji("📞")
    .setLabel("Chamar Mod")
    .setStyle("SUCCESS"),
  new MessageButton()
    .setCustomId("finish_match")
    .setEmoji("🏁")
    .setLabel("Finalizar Partida")
    .setStyle("DANGER")
);

export async function handleButtonInteractionPlayerMenu(
  btnInt: ButtonInteraction
) {
  const log = (...message: any[]) => {
    console.log(`[${btnInt.user.username}] --`, ...message);
  };

  async function deleteCategory(btnInt) {
    const parent = btnInt.message.channel.parent;
    const category = await btnInt.guild.channels.cache.get(parent.id);

    category.children.forEach((channel) => channel.delete());
    category.delete();
  }

  try {
    await btnInt.deferReply({
      ephemeral: false,
      fetchReply: false,
    });
    switch (btnInt.customId) {
      case "call_mod":
        log("Iniciando ação do botão", btnInt.customId);
        await btnInt.editReply({
          content: `<@&${roleTeste}>`,
        });
        break;
      case "finish_match":
        log("Iniciando ação do botão", btnInt.customId);
        // delete bot reply
        await btnInt.deleteReply();
        // display menu
        const sendMessage = await btnInt.channel.send({
          embeds: [FinishLobby],
        });
        await sendMessage.react("1️⃣");
        await sendMessage.react("2️⃣");
        await sendMessage.react("❌");
        const collectorReaction = sendMessage.createReactionCollector({});
        const data = await fetchCategory(btnInt.user.id);
        const category_id = data[0].category_id;
        if (!data[0].category_id) {
          await btnInt.editReply("Ocorreu um erro, Tento novamente!");

          setTimeout(() => btnInt.deleteReply(), 3000);

          return;
        }

        collectorReaction.on("collect", async (reaction, user) => {
          if (reaction.emoji.name === "1️⃣" && !user.bot) {
            if (reaction.count >= 6) {
              updateWinnerAndFinishTime("Time 1", category_id);
              collectorReaction.stop();
            }
            console.log(reaction.count);
          } else if (reaction.emoji.name === "2️⃣" && !user.bot) {
            if (reaction.count >= 6) {
              updateWinnerAndFinishTime("Time 2", category_id);
              collectorReaction.stop();
            }
          } else if (reaction.emoji.name === "❌" && !user.bot) {
            sendMessage.delete();
            btnInt.channel.send({
              content: "Partida cancelada!",
            });
            collectorReaction.stop();
            setTimeout(() => deleteCategory(btnInt), 3000);
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

                await member.voice.setChannel(waiting_room_id);
              } catch (error) {
                console.log("Usuario não conectado");
              }
            }
            await removeUsersFromCategory(category_id);
            setTimeout(async () => await deleteCategory(btnInt), 3000);
            console.log(`Collected ${collected.size} items`);
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

const role1 = "945293155866148914";
const role2 = "958065673156841612";
const role3 = "968697582706651188";
const roleTeste = "965501155016835085";

export default new Command({
  name: "4v4",
  description: "start 4v4 match with player in queue",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const qtd = 8;
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
          ],
        }
      );

      // TEXT CHAT
      await interaction.guild.channels
        .create("Chat", {
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
        })
        .then(async (channel) => {
          // Team 1 Acess to TextChat
          players.forEach(async (player) => {
            try {
              await channel.permissionOverwrites.create(player.user_id, {
                VIEW_CHANNEL: true,
              });
            } catch (error) {
              console.log(error);
            }
          });
          // Team 2 Acess to TextChat
          team2.forEach(async (player) => {
            try {
              await channel.permissionOverwrites.create(player.user_id, {
                VIEW_CHANNEL: true,
              });
            } catch (error) {
              console.log(error);
            }
          });
          channel.send({
            embeds: [StartLobby],
            components: [BUTTONS],
          });
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

      await interaction.deleteReply();
    } else {
      interaction.editReply({
        embeds: [embedPermission],
      });
    }

    const collectorButton = interaction.channel.createMessageComponentCollector(
      {
        componentType: "BUTTON",
      }
    );

    collectorButton.on("end", (collectedButton) => {
      console.log(`Ended Collecting ${collectedButton.size} items`);
    });
  },
});
