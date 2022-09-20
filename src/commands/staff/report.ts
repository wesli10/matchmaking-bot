import { Command } from "../../structures/Command";
import { fetchToCSV } from "../../utils/db";
import fs from "fs";
import { MessageEmbed } from "discord.js";
import { embedPermission } from "../../utils/embeds";

const choices = [
  {
    name: "Valorant",
    value: "VALORANT",
  },
  {
    name: "League of Legends",
    value: "LEAGUE_OF_LEGENDS",
  },
];

export default new Command({
  name: "relatorio",
  description: "export csv",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    {
      name: "game",
      description: "Game you need data",
      type: "STRING",
      required: true,
      choices,
    },
    {
      name: "dia",
      description: "Day of the month",
      type: "STRING",
      required: true,
    },
    {
      name: "mes",
      description: "Month of the year",
      type: "STRING",
      required: true,
    },
    {
      name: "ano",
      description: "Year",
      type: "STRING",
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const game = interaction.options.getString("game");
    const day = interaction.options.getString("dia");
    const month = interaction.options.getString("mes");
    const year = interaction.options.getString("ano");

    const embedExport = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Relatório")
      .setDescription(`Relatório exportado com sucesso!`);

    if (game === "LEAGUE_OF_LEGENDS") {
      const data = await fetchToCSV("lobbys_lol", day, month, year);

      if (interaction.memberPermissions.has("ADMINISTRATOR")) {
        interaction.editReply({
          embeds: [embedExport],
        });

        fs.writeFile(`${day}-${month}.csv`, data, (err) => {
          if (err) throw err;

          interaction
            .editReply({ files: [`${day}-${month}.csv`] })
            .catch((error) => console.log(error));
        });
      }
    } else if (game === "VALORANT") {
      const data = await fetchToCSV("lobbys_valorant", day, month, year);

      if (interaction.memberPermissions.has("ADMINISTRATOR")) {
        interaction.editReply({
          embeds: [embedExport],
        });

        fs.writeFile(`${day}-${month}.csv`, data, (err) => {
          if (err) throw err;

          interaction
            .editReply({ files: [`${day}-${month}.csv`] })
            .catch((error) => console.log(error));
        });
      }
    }
  },
});
