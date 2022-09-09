import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

// VALORANT BUTTONS

export const buttonFinishMatch_valorant = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("finish_match_valorant")
    .setEmoji("🏁")
    .setLabel("Finalizar Partida")
    .setStyle("DANGER")
);

export const buttonFinishMatchDisabled_valorant =
  new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("finish_match_valorant")
      .setEmoji("🏁")
      .setLabel("Finalizar Partida")
      .setStyle("DANGER")
      .setDisabled(true)
  );

export const buttonConfirmFinishMatch_valorant =
  new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("confirm_finish_match_valorant")
      .setEmoji("🏁")
      .setLabel("Encerrar Partida")
      .setStyle("DANGER")
  );

export const buttonCallMod_valorant = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("call_mod_valorant")
    .setEmoji("📞")
    .setLabel("Chamar Mod")
    .setStyle("SUCCESS")
);

// LEAGUE OF LEGENDS BUTTONS

export const buttonFinishMatch_lol = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("finish_match_lol")
    .setEmoji("🏁")
    .setLabel("Finalizar Partida")
    .setStyle("DANGER")
);

export const buttonCallMod_lol = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("call_mod_lol")
    .setEmoji("📞")
    .setLabel("Chamar Mod")
    .setStyle("SUCCESS")
);

export const buttonFinishMatchDisabled_lol =
  new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("finish_match_lol")
      .setEmoji("🏁")
      .setLabel("Finalizar Partida")
      .setStyle("DANGER")
      .setDisabled(true)
  );

export const buttonConfirmFinishMatch_lol =
  new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("confirm_finish_match_lol")
      .setEmoji("🏁")
      .setLabel("Encerrar Partida")
      .setStyle("DANGER")
  );

export const PreFinishLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("Atenção, confirme para a partida ser finalizada!")
  .setDescription(
    "Clique em finalizar partida abaixo para confirmar a finalização.\n Se precisar, chame os organizadores."
  );

export const FinishLobby = new MessageEmbed()
  .setColor("#fd4a5f")
  .setTitle("A partida foi finalizada!")
  .setDescription(
    "Clique na reação adequada para indicar qual time foi o vencedor.\n Se precisar, chame os organizadores."
  );
