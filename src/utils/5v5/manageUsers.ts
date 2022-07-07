import { CategoryChannel, MessageEmbed, TextChannel } from "discord.js";
import { client } from "../..";
import { deleteCategory } from "../../commands/staff/startLobby";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { PartidaCancelada } from "../4v4/messageInteractionsTemplates";
import {
  createLobbyValorant,
  fetchUsersFromCategory,
  removeUsersFromCategory,
  updateCategory,
  updateInMatch,
  updateModerator,
  updateResultUser,
  updateUserCaptain,
  updateUserTeam,
} from "../db";
import {
  buttonCallMod_valorant,
  buttonFinishMatch_valorant,
} from "./messageInteractionsTemplates";

export async function removeusersFromChannel(
  category_id,
  waiting_room_id,
  interaction
) {
  const users = await fetchUsersFromCategory("users_5v5", category_id);

  for (const user of users) {
    try {
      const member = await interaction.guild.members.fetch(user.user_id);
      await member.voice
        .setChannel(waiting_room_id)
        .catch((error) => console.log(error));
    } catch (error) {
      console.log(error);
    }
  }

  return;
}

export async function valorantManageUsersFunc(
  interaction,
  channelTeam1,
  channelTeam2
) {
  const channel: TextChannel = await interaction.channel;
  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  const players = await fetchUsersFromCategory("users_5v5", channel.parentId);
  for (const player of players) {
    const member = await interaction.guild.members.fetch(player.user_id);
    await Promise.all([
      await createLobbyValorant(player.user_id, channel.parentId, player.team),
      updateInMatch("users_5v5", player.user_id, true),
      member.voice
        .setChannel(player.team === "Time 1" ? channelTeam1 : channelTeam2)
        .catch((error) => console.log(error)),
    ]);
  }
}

export async function valorantCaptainChoose(players: Array<any>) {
  const playersList = players.map((player) => player);
  const player = playersList[Math.floor(Math.random() * playersList.length)];
  await updateUserCaptain(player.user_id, "captain");

  return player.user_id;
}

export async function valorantStartLobbyFunc(sendMessage) {
  const channel = await client.channels.cache.get(sendMessage.channelId);
  if (channel.type !== "GUILD_TEXT") {
    return;
  }
  const category: CategoryChannel = sendMessage.channel.parent;
  const players = await fetchUsersFromCategory("users_5v5", category.id);
  const channelTeam1 = category.children.find(
    (channel) => channel.name === "Time 1"
  );
  const channelTeam2 = category.children.find(
    (channel) => channel.name === "Time 2"
  );
  valorantManageUsersFunc(sendMessage, channelTeam1.id, channelTeam2.id);

  await sendMessage.delete();

  const mapChoosed = sendMessage.embeds[0].description.split("\n")[0];

  const captain = await valorantCaptainChoose(players);

  const choosedMapEmbed = new MessageEmbed()
    .setColor("#fd4a5f")
    .setTitle("Lobby Iniciado")
    .setDescription(
      ` O jogador <@${captain}> foi escolhido como capitão para criar o lobby in game! \n\n ${mapChoosed} \n\n Time 1: \n ${players
        .filter((player) => player.team === "Time 1")
        .map((player) => `<@${player.user_id}>`)
        .join("\n")} \n\n Time 2: \n ${players
        .filter((player) => player.team === "Time 2")
        .map((player) => `<@${player.user_id}>`)
        .join("\n")}`
    );
  await channel.send({
    embeds: [choosedMapEmbed],
  });

  await channel.send({
    components: [buttonFinishMatch_valorant, buttonCallMod_valorant],
  });
}

export async function valorantFinishMatchFunc(sendMessage, winnerTeam?) {
  const channel = await sendMessage.channel.fetch();
  const waiting_room_id = DISCORD_CONFIG.channels.waiting_room_id;
  try {
    if (channel.type !== "GUILD_TEXT") {
      return;
    }
    const category = channel.parentId;
    const players = await fetchUsersFromCategory("users_5v5", category);
    for (const player of players) {
      await Promise.all([
        await updateCategory("users_5v5", player.user_id, ""),
        await updateUserTeam("users_5v5", player.user_id, ""),
        await updateUserCaptain(player.user_id, ""),
        await updateInMatch("users_5v5", player.user_id, false),
        await updateModerator("users_5v5", player.user_id, ""),
        await removeusersFromChannel(
          category,
          DISCORD_CONFIG.channels.waiting_room_id,
          sendMessage
        ),
      ]);
      if (player.team === winnerTeam) {
        await updateResultUser(
          "lobbys_valorant",
          player.user_id,
          channel.parentId,
          "Venceu"
        );
      } else if (
        player.team !== winnerTeam &&
        winnerTeam !== "Partida Cancelada"
      ) {
        await updateResultUser(
          "lobbys_valorant",
          player.user_id,
          channel.parentId,
          "Perdeu"
        );
      } else if (winnerTeam === "Partida Cancelada") {
        await updateResultUser(
          "lobbys_valorant",
          player.user_id,
          channel.parentId,
          "Cancelado"
        );
      }
      await removeusersFromChannel(
        channel.parentId,
        waiting_room_id,
        sendMessage
      );
    }
  } catch (error) {
    console.log(error);
  }

  await channel.send({
    embeds: [PartidaCancelada],
  });
}
