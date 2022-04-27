import { MessageEmbed } from "discord.js";

export const embedPermission = new MessageEmbed()
  .setColor("#0099ff")
  .setTitle("Insuficient Permissions!")
  .setDescription(
    "❌❌ You don't have the permissions to use this command! ❌❌"
  );

export const embedEnoughPlayers = new MessageEmbed()
  .setColor("RANDOM")
  .setTitle("Espere um momento!")
  .setDescription("Não há jogadores suficientes para iniciar o jogo!");
