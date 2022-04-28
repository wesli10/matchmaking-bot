import { TextChannel } from "discord.js";
import { Command } from "../../structures/Command";
import { MessageEmbed } from "discord.js";
import { clearQueue } from "../../utils/db";
import { clear } from "../../utils/utils";

export default new Command({
  name: "fecharfila",
  description: "Close queue to players",
  userPermissions: ["ADMINISTRATOR"],
  run: async ({ interaction }) => {
    const role1 = "945293155866148914";
    const role2 = "958065673156841612";
    const role3 = "968697582706651188";
    const roleTeste = "965501155016835085";
    const admin = JSON.stringify(interaction.member.roles.valueOf());
    const queueRoom_id = "968922689190371328";

    const embedCloseQueue = new MessageEmbed()
      .setColor("#fd4a5f")
      .setTitle("Fila Fechada!")
      .setDescription(
        "As filas estão fechada no momento, tente novamente em outro horário!"
      );

    if (
      admin.includes(role1) ||
      admin.includes(role2) ||
      admin.includes(role3) ||
      admin.includes(roleTeste)
    ) {
      clear(interaction);
      interaction
        .followUp({
          content: "⠀",
        })
        .then(() => interaction.deleteReply());

      const channel = interaction.guild.channels.cache.get(
        queueRoom_id
      ) as TextChannel;

      channel.send({
        content: "⠀",
        embeds: [embedCloseQueue],
      });
      clearQueue();
    }
  },
});
