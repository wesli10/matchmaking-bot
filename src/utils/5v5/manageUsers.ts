import { table } from "console";
import {
  CategoryChannel,
  MessageEmbed,
  OverwriteResolvable,
  TextChannel,
} from "discord.js";
import { client } from "../..";
import { deleteCategory } from "../../commands/staff/startLobby";
import { DISCORD_CONFIG } from "../../configs/discord.config";
import { getPermissions } from "../../configs/permissions.config";
import {
  PartidaCancelada,
  StartLobby,
} from "../4v4/messageInteractionsTemplates";
import {
  createLobbyLeagueOfLegends,
  createLobbyValorant,
  fetchUsersFromCategory,
  removeUser,
  removeUsersFromCategory,
  updateCategory,
  updateInMatch,
  updateModerator,
  updateResultUser,
  updateUserCaptain,
  updateUserTeam,
} from "../db";
import {
  buttonCallMod_lol,
  buttonCallMod_valorant,
  buttonFinishMatch_lol,
  buttonFinishMatch_valorant,
} from "./messageInteractionsTemplates";

export async function removeusersFromChannel(
  table,
  category_id,
  waiting_room_id,
  interaction
) {
  const users = await fetchUsersFromCategory(table, category_id);

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

export async function leagueOfLegendsManageUsersFunc(
  interaction,
  channelTeam1,
  channelTeam2
) {
  const channel: TextChannel = await interaction.channel;
  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  const players = await fetchUsersFromCategory("queue_lol", channel.parentId);
  for (const player of players) {
    const member = await interaction.guild.members.fetch(player.user_id);
    await Promise.all([
      await createLobbyLeagueOfLegends(
        player.user_id,
        channel.parentId,
        player.team
      ),
      member.voice
        .setChannel(player.team === "Time 1" ? channelTeam1 : channelTeam2)
        .catch((error) =>
          console.log("Usuario não está conectado no canal de voz")
        ),
    ]);
  }

  await channel.send({
    embeds: [StartLobby],
    components: [buttonFinishMatch_lol, buttonCallMod_lol],
  });
}

export async function valorantCaptainChoose(players: Array<any>) {
  const playersList = players?.map((player) => player);
  const player = playersList[Math.floor(Math.random() * playersList.length)];
  await updateUserCaptain("users_5v5", player?.user_id, "captain");

  return player.user_id;
}

export async function leagueoflegendsCaptainChoose(players: Array<any>) {
  const playersList = players.map((player) => player);
  const player = playersList[Math.floor(Math.random() * playersList.length)];
  await updateUserCaptain("queue_lol", player.user_id, "captain");

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

export async function dodgeQueueUsersManage(
  table,
  sendMessage,
  playersExpected
) {
  const messageChannel = await client.channels.cache.get(sendMessage.channelId);
  if (messageChannel.type !== "GUILD_TEXT") {
    return;
  }
  const messageReacted = await messageChannel.messages.fetch(sendMessage.id);

  messageReacted.reactions.cache.forEach(async (reaction) => {
    const reactionsPlayers = await reaction.users.fetch();
    const playersReact = reactionsPlayers.map((user) => user.id);
    const dodgePlayers = playersExpected.filter(
      (x) => !playersReact.includes(x)
    );

    for (const player of dodgePlayers) {
      await removeUser(table, player);
    }
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
        "users_5v5",
        channel.parentId,
        waiting_room_id,
        sendMessage
      );
    }

    setTimeout(
      async () => await removeUsersFromCategory("users_5v5", category),
      5000
    );
    setTimeout(async () => await deleteCategory(sendMessage), 5000);
  } catch (error) {
    console.log(error);
  }
}

export async function leagueOfLegendsFinishLobbyFunc(sendMessage, winnerTeam?) {
  const channel = await sendMessage.channel.fetch();
  const waiting_room_id = DISCORD_CONFIG.channels.waiting_room_id;
  try {
    if (channel.type !== "GUILD_TEXT") {
      return;
    }
    const category = channel.parentId;
    const players = await fetchUsersFromCategory("queue_lol", category);

    for (const player of players) {
      if (player.team === winnerTeam) {
        await updateResultUser(
          "lobbys_lol",
          player.user_id,
          channel.parentId,
          "Venceu"
        );
      } else if (
        player.team !== winnerTeam &&
        winnerTeam !== "Partida Cancelada"
      ) {
        await updateResultUser(
          "lobbys_lol",
          player.user_id,
          channel.parentId,
          "Perdeu"
        );
      } else if (winnerTeam === "Partida Cancelada") {
        await updateResultUser(
          "lobbys_lol",
          player.user_id,
          channel.parentId,
          "Cancelado"
        );
      }
      await removeusersFromChannel(
        "queue_lol",
        channel.parentId,
        waiting_room_id,
        sendMessage
      );
    }

    setTimeout(
      async () => await removeUsersFromCategory("queue_lol", category),
      5000
    );
    setTimeout(async () => await deleteCategory(sendMessage), 5000);
  } catch (error) {
    console.log(error);
  }
}

export async function createChannels(interaction, playersTeam1, playersTeam2) {
  const permissions: OverwriteResolvable[] = [
    ...getPermissions(interaction),
    // Add players permissions as well
    ...playersTeam1.map((player) => {
      return {
        id: player?.user_id,
        allow: ["VIEW_CHANNEL"],
        deny: ["SPEAK"],
      };
    }),
    ...playersTeam2.map((player) => {
      return {
        id: player?.user_id,
        allow: ["VIEW_CHANNEL"],
        deny: ["SPEAK"],
      };
    }),
  ];

  const permissionsTeam1: OverwriteResolvable[] = [
    ...getPermissions(interaction),
    // Add players permissions as well
    ...playersTeam1.map((player) => {
      return {
        id: player?.user_id,
        allow: ["VIEW_CHANNEL", "SPEAK"],
      };
    }),
  ];

  const permissionsTeam2: OverwriteResolvable[] = [
    ...getPermissions(interaction),
    // Add players permissions as well
    ...playersTeam2.map((player) => {
      return {
        id: player?.user_id,
        allow: ["VIEW_CHANNEL", "SPEAK"],
      };
    }),
  ];

  const permissionsAnnouncements: OverwriteResolvable[] = [
    ...getPermissions(interaction),
    // Add players permissions as well
    ...playersTeam1.map((player) => {
      return {
        id: player?.user_id,
        allow: ["VIEW_CHANNEL"],
        deny: ["SEND_MESSAGES"],
      };
    }),
    ...playersTeam2.map((player) => {
      return {
        id: player?.user_id,
        allow: ["VIEW_CHANNEL"],
        deny: ["SEND_MESSAGES"],
      };
    }),
  ];

  // Create category
  const category = await interaction.guild.channels.create(
    `Lobby - ${Math.floor(Math.random() * 999)}`,
    {
      type: "GUILD_CATEGORY",
      permissionOverwrites: permissions,
    }
  );

  // Create Text Chat
  const textChatAnnouncements = await interaction.guild.channels.create(
    "Informação",
    {
      type: "GUILD_TEXT",
      parent: category.id,
      permissionOverwrites: permissionsAnnouncements,
    }
  );

  // Create Voice Channel Team 1
  await interaction.guild.channels.create("Time 1", {
    type: "GUILD_VOICE",
    parent: category.id,
    permissionOverwrites: permissionsTeam1,
  });

  // Create Voice Channel Team 2
  await interaction.guild.channels.create("Time 2", {
    type: "GUILD_VOICE",
    parent: category.id,
    permissionOverwrites: permissionsTeam2,
  });

  return {
    category,
    textChatAnnouncements,
  };
}
