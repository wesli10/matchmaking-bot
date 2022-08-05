import { MessageAttachment, MessageEmbed } from "discord.js";
import dotenv from "dotenv";
import { choosePontuation } from "../commands/staff/ranking";
import { GAME_LIST } from "./gameList";
import generateRankingImage from "./rankingImage";
dotenv.config();

const choices = [
  { name: "Free Fire", value: "FREE_FIRE" },
  { name: "Valorant", value: "VALORANT" },
  { name: "League of Legends", value: "LEAGUE_OF_LEGENDS" },
];

const findChoiceByValue = (value: string) =>
  choices.find((choice) => choice.value === value);

const weeklyRanking = async (client) => {
  const textChannelId = process.env.DISCORD_CHANNEL_RANKING_ROOM;
  const textChannel = client.channels.cache.get(textChannelId);

  const titleMessage = new MessageEmbed()
    .setColor("#0097e6")
    .setTitle("Esse é o nosso Ranking Semanal!")
    .setDescription(
      "Aqui estão os 10 melhores jogadores da semana, com a quantidade de pontos que eles obtiveram, separado por cada jogo. @everyone"
    );

  textChannel.send({
    embeds: [titleMessage],
    components: [],
    ephemeral: true,
  });

  await sendSemanal(GAME_LIST.VALORANT, textChannel);
  await sendSemanal(GAME_LIST.FREE_FIRE, textChannel);
  await sendSemanal(GAME_LIST.LEAGUE_OF_LEGENDS, textChannel);
};

const sendSemanal = async (game: GAME_LIST, textChannel) => {
  const pontuation = await pontuacaoGame(game);

  // if (pontuation.length > 0) {
  //   return;
  // }

  const imgRanking = await generateRankingImage(
    pontuation,
    GAME_LIST[game],
    "Ranking Semanal"
  );

  textChannel.send({
    files: [new MessageAttachment(imgRanking, `ranking.png`)],
    embeds: [
      new MessageEmbed().setTitle(`Top 10 do Ranking:`).setDescription(
        `Esses são os 10 primeiros colocados no Ranking Semanal ${
          findChoiceByValue(game).name
        }: ` +
          pontuation
            .map((user) => {
              return `<@${user.user_id}>`;
            })
            .join(", ")
      ),
    ],
  });
};

const pontuacaoGame = async (game: GAME_LIST) => {
  return await choosePontuation(game, "S");
};

export default weeklyRanking;
