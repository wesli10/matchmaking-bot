import { Command } from "../../structures/Command";
import { fetchToCSV } from "../../utils/db";
import fs from "fs";
import { MessageEmbed } from "discord.js";
import { embedPermission } from "../../utils/embeds";

export default new Command({
  name: "relatorio",
  description: "export csv",
  userPermissions: ["ADMINISTRATOR"],
  options: [
    {
      name: "Dia",
      description: "Day of the month",
      type: "STRING",
      required: true,
    },
    {
      name: "Mês",
      description: "Month of the year",
      type: "STRING",
      required: true,
    },
    {
      name: "Ano",
      description: "Year",
      type: "STRING",
      required: true,
    },
  ],
  run: async ({ interaction }) => {
    const day = interaction.options.getString("day");
    const month = interaction.options.getString("month");
    const year = interaction.options.getString("year");

    const data = await fetchToCSV(day, month, year);

    const embedExport = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Relatório")
      .setDescription(`Relatório exportado com sucesso!`);

    if (interaction.memberPermissions.has("ADMINISTRATOR")) {
      interaction.editReply({
        embeds: [embedExport],
      });

      fs.writeFile("data.csv", data, (err) => {
        if (err) throw err;

        interaction.user.send({ files: ["data.csv"] });
      });
    } else {
      interaction.editReply({
        embeds: [embedPermission],
      });
    }
  },
});
