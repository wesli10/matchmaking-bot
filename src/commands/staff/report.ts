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
    const day = interaction.options.getString("dia");
    const month = interaction.options.getString("mes");
    const year = interaction.options.getString("ano");

    const data = await fetchToCSV(day, month, year);

    const embedExport = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Relatório")
      .setDescription(`Relatório exportado com sucesso!`);

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
    } else {
      interaction.editReply({
        embeds: [embedPermission],
      });
    }
  },
});
