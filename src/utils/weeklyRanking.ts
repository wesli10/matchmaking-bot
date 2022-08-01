import { MessageEmbed } from "discord.js";
import dotenv from "dotenv";
import { choosePontuation } from "../commands/staff/ranking";
import { GAME_LIST } from "./gameList";
dotenv.config();

const weeklyRanking = async (client) => {
  const textChannelId = process.env.DISCORD_CHANNEL_RANKING_ROOM;
  const textChannel = client.channels.cache.get(textChannelId);

  const titleMessage = new MessageEmbed()
    .setColor("#0097e6")
    .setTitle("Esse é o nosso Ranking Semanal!")
    .setDescription(
      "Aqui estão os 3 melhores jogadores da semana, com a quantidade de pontos que eles obtiveram, separado por cada jogo. @everyone"
    );

  const lolMessage = new MessageEmbed()
    .setColor("#445fa5")
    .setTitle("LOL")
    .setDescription(`${await pontuacaoGame(GAME_LIST.LEAGUE_OF_LEGENDS)}`);

  const freefireMessage = new MessageEmbed()
    .setColor("#f27d0c")
    .setTitle("FREE FIRE")
    .setDescription(`${await pontuacaoGame(GAME_LIST.FREE_FIRE)}`);

  const valorantMessage = new MessageEmbed()
    .setColor("#fa4454")
    .setTitle("VALORANT")
    .setDescription(`${await pontuacaoGame(GAME_LIST.VALORANT)}`);

  textChannel.send({
    embeds: [titleMessage, valorantMessage, lolMessage, freefireMessage],
    components: [],
    ephemeral: true,
  });
};

const pontuacaoGame = async (game: GAME_LIST) => {
  const pontuation = await choosePontuation(game, "S");

  const strRanking =
    pontuation.length > 0
      ? pontuation
          .slice(0, 3)
          .map((user, index) => {
            return `${index + 1}. <@${user.user_id}> ~ **${
              user.actual_pontuation
            } pontos**`;
          })
          .join("\n")
      : "Nenhuma pontuação para este jogo encontrado.";

  return strRanking;
};

export default weeklyRanking;
