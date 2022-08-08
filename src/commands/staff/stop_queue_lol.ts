import { Command } from "../../structures/Command";
import { takeOffQueue } from "./lol_queue";

export default new Command({
  name: "stop_queue_lol",
  description: "Encerra a fila de espera do lol",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    await takeOffQueue();

    await interaction.deleteReply();

    const channel = interaction.channel;
    if (channel.type !== "GUILD_TEXT") return;

    await channel.send({
      content: "Fila Encerrada",
    });
  },
});
