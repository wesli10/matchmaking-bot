import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { DISCORD_CONFIG } from "../../configs/discord.config";

const { roles } = DISCORD_CONFIG;

const role_aux_event = roles.aux_event;

export const StartLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Começo de Lobby")
  .setDescription(
    "A sua sala premiada irá iniciar em instantes.\n Se encontrar problemas ou precisar reportar um jogador, utilize os controles do bot"
  );

export const PartidaCancelada = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Partida Cancelada")
  .setDescription("A partida foi cancelada.");

export const embedTime1 = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Vencedor da Partida")
  .setDescription(
    `O time 1 foi declarado como vencedor!\n <@&${role_aux_event}>, reaja com ✅ abaixo para confirmar o resultado e finalizar o Lobby \n ou com 🛑 para resetar a votação. `
  );

export const embedTime2 = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Vencedor da Partida")
  .setDescription(
    `O time 2 foi declarado como vencedor!\n <@&${role_aux_event}>, reaja com ✅ abaixo para confirmar o resultado e finalizar o Lobby \n ou com 🛑 para resetar a votação.`
  );

export const FinishLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("A partida foi finalizada!")
  .setDescription(
    "Clique na reação adequada para indicar qual time foi o vencedor.\n Se precisar, chame os organizadores."
  );
export const PreFinishLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Atenção, confirme para a partida ser finalizada!")
  .setDescription(
    "Clique em finalizar partida abaixo para confirmar a finalização.\n Se precisar, chame os organizadores."
  );
export const FinishedMatch = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Atenção, Partida Já Finalizada!")
  .setDescription("Essa partida já foi finalizada anteriormente.");
export const buttonCallMod = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("call_mod")
    .setEmoji("📞")
    .setLabel("Chamar Mod")
    .setStyle("SUCCESS")
);
export const buttonFinishMatch = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("finish_match")
    .setEmoji("🏁")
    .setLabel("Finalizar Partida")
    .setStyle("DANGER")
);

export const buttonFinishMatchDisabled = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("finish_match")
    .setEmoji("🏁")
    .setLabel("Finalizar Partida")
    .setStyle("DANGER")
    .setDisabled(true)
);

export const buttonConfirmFinishMatch = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("confirm_finish_match")
    .setEmoji("🏁")
    .setLabel("Encerrar Partida")
    .setStyle("DANGER")
);

export const buttonConfirmFinishMatchDisabled =
  new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("confirm_finish_match")
      .setEmoji("🏁")
      .setLabel("Finalizar Partida")
      .setStyle("DANGER")
      .setDisabled(true)
  );
