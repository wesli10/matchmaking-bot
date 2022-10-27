import { MessageEmbed } from "discord.js";

export const embedPermission = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Insuficient Permissions!")
  .setDescription(
    "❌❌ You don't have the permissions to use this command! ❌❌"
  );

export const embedEnoughPlayers = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Espere um momento!")
  .setDescription("Não há jogadores suficientes para iniciar o jogo!");

export const embedChannelInvalid = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Canal Invalido")
  .setDescription("Este Canal não pode receber comandos");
