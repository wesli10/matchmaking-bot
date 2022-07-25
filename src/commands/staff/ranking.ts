import { MessageEmbed } from "discord.js";
import { Command } from "../../structures/Command";
import { getPontuation } from "../../utils/db";
import { GAME_LIST } from "../../utils/gameList";

const choices = [
  { name: "Free Fire", value: "FREE_FIRE" },
  { name: "Valorant", value: "VALORANT" },
  { name: "League of Legends", value: "LEAGUE_OF_LEGENDS" },
];

const findChoiceByValue = (value: string) =>
  choices.find((choice) => choice.value === value);

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
  ],
  run: async ({ interaction }) => {
    const game = interaction.options.getString("game");

    const pontuation = await getPontuation(GAME_LIST[game]);

    const strRanking =
      pontuation.length > 0
        ? pontuation
            .map((user, index) => {
              return `${index + 1}. <@${user.user_id}> - ${
                user.actual_pontuation
              } pontos`;
            })
            .join("\n")
        : "Nenhuma pontuação para este jogo encontrado.";

    console.log(strRanking);

    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setColor("#00bbff")
          .setTitle(`Top 10 do Ranking ${findChoiceByValue(game).name}:`)
          .setDescription(strRanking),
      ],
    });
  },
});
