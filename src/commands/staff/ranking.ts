import { MessageAttachment, MessageEmbed } from "discord.js";
import { Command } from "../../structures/Command";
import { getPontuation, getPontuationRange } from "../../utils/db";
import { GAME_LIST } from "../../utils/gameList";
import generateRankingImage from "../../utils/rankingImage";

const choices = [
  { name: "Free Fire", value: "FREE_FIRE" },
  { name: "Valorant", value: "VALORANT" },
  { name: "League of Legends", value: "LEAGUE_OF_LEGENDS" },
];

const options = [
  { name: "Geral", value: "G" },
  { name: "Diário", value: "D" },
  { name: "Semanal", value: "S" },
  { name: "Mensal", value: "M" },
];

const findChoiceByValue = (value: string) =>
  choices.find((choice) => choice.value === value);

const findOptionByValue = (value: string) =>
  options.find((option) => option.value === value);

export default new Command({
  name: "ranking",
  description: "Exibir o Ranking (Leaderboard) de um jogo.",
  userPermissions: [],
  options: [
    {
      name: "game",
      description: "Jogo",
      type: "STRING",
      required: true,
      choices,
    },
    {
      name: "option",
      description: "Opção",
      type: "STRING",
      required: true,
      choices: options,
    },
  ],
  run: async ({ interaction }) => {
    const game = interaction.options.getString("game");
    const option = interaction.options.getString("option");

    const pontuation = await choosePontuation(GAME_LIST[game], option);

    if (pontuation.length > 0) {
      const imgRanking = await generateRankingImage(
        pontuation,
        GAME_LIST[game],
        "Ranking " + findOptionByValue(option).name
      );

      interaction.editReply({
        files: [new MessageAttachment(imgRanking, `ranking.png`)],
        embeds: [
          new MessageEmbed()
            .setTitle(
              `Top 10 do Ranking ${findChoiceByValue(game).name} ${
                findOptionByValue(option).name
              }:`
            )
            .setDescription(
              `Esses são os 10 primeiros colocados no Ranking ${
                findChoiceByValue(game).name
              } ${findOptionByValue(option).name}: ` +
                pontuation
                  .map((user) => {
                    return `<@${user.user_id}>`;
                  })
                  .join(", ")
            ),
        ],
      });
    } else {
      interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("Ranking")
            .setDescription("Nenhuma pontuação para este jogo encontrado.")
            .setColor("#00bbff"),
        ],
      });
    }

    // interaction.editReply({
    //   embeds: [
    //     new MessageEmbed()
    //       .setColor("#00bbff")
    //       .setTitle(
    //         `Top 10 do Ranking ${findChoiceByValue(game).name} ${
    //           findOptionByValue(option).name
    //         }:`
    //       )
    //       .setDescription(strRanking),
    //   ],
    // });
  },
});

export const choosePontuation = async (game: GAME_LIST, option: string) => {
  let pontuation = [];

  switch (option) {
    case "G":
      pontuation = await getPontuation(game);
      break;

    case "D":
      let startOfTheDay = new Date();
      startOfTheDay.setHours(0, 0, 0, 0);

      let endOfTheDay = new Date();
      endOfTheDay.setHours(23, 59, 59, 999);

      pontuation = await getPontuationRange(getGameTable(game), {
        start: startOfTheDay,
        end: endOfTheDay,
      });
      break;

    case "S":
      let startOfTheWeek = new Date();
      startOfTheWeek.setDate(
        startOfTheWeek.getDate() - startOfTheWeek.getDay()
      );

      let endOfTheWeek = new Date();
      endOfTheWeek.setDate(endOfTheWeek.getDate() - endOfTheWeek.getDay() + 6);

      pontuation = await getPontuationRange(getGameTable(game), {
        start: startOfTheWeek,
        end: endOfTheWeek,
      });
      break;

    case "M":
      let startOfTheMonth = new Date();
      startOfTheMonth.setDate(1);

      let endOfTheMonth = new Date();
      endOfTheMonth.setDate(endOfTheMonth.getDate() - 1);

      pontuation = await getPontuationRange(getGameTable(game), {
        start: startOfTheMonth,
        end: endOfTheMonth,
      });
      break;
  }

  return pontuation;
};

const getGameTable = (game: GAME_LIST) => {
  let tabela = "";

  switch (game) {
    case GAME_LIST.FREE_FIRE:
      tabela = "lobbys";
      break;

    case GAME_LIST.VALORANT:
      tabela = "lobbys_valorant";
      break;

    case GAME_LIST.LEAGUE_OF_LEGENDS:
      tabela = "lobbys_lol";
      break;
  }

  return tabela;
};
