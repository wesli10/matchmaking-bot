import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
} from "discord.js";

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

export const image_url_lol =
  "https://static.wikia.nocookie.net/leagueoflegends/images/7/7b/League_of_Legends_Cover.jpg/revision/latest/scale-to-width-down/1000";

export const StartQueue_lol = new MessageEmbed()
  .setColor("#fd4a5f")
  .setImage(image_url_lol)
  .setTitle(
    "Sejam bem vindos as salas premiadas de League of Legends da SNACKCLUB!"
  )
  .setDescription(
    "Para entrar na fila, aperte o botão abaixo e aguarde na chamada de voz"
  );

export const BUTTONS_lol = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("enter_queue_lol")
    .setEmoji("🎮")
    .setLabel("Entrar na Fila")
    .setStyle("SUCCESS"),
  new MessageButton()
    .setCustomId("leave_queue_lol")
    .setEmoji("❌")
    .setLabel("Sair da Fila")
    .setStyle("DANGER")
);

export const row_lol = new MessageActionRow().addComponents(
  new MessageSelectMenu()
    .setCustomId("roles_lol")
    .setPlaceholder("Selecione as posições")
    .setMinValues(2)
    .setMaxValues(2)
    .addOptions([
      {
        label: "TOP",
        value: "Top-laner",
      },
      {
        label: "JUNGLE",
        value: "Jungler",
      },
      {
        label: "MID",
        value: "Mid-laner",
      },
      {
        label: "AD CARRY",
        value: "AD Carry",
      },
      {
        label: "SUPPORT",
        value: "Support",
      },
    ])
);
export const image_url_valorant =
  "https://static.wikia.nocookie.net/valorant/images/8/80/Valorant_Cover_Art.jpg/revision/latest/scale-to-width-down/1000";

export const StartQueue_valorant = new MessageEmbed()
  .setColor("#fd4a5f")
  .setImage(image_url_valorant)
  .setTitle("Sejam bem vindos as salas premiadas de Valorant da SNACKCLUB!")
  .setDescription(
    "Para entrar na fila, aperte o botão abaixo e aguarde na chamada de voz"
  );

export const BUTTONS_valorant = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("enter_queue_valorant")
    .setEmoji("🎮")
    .setLabel("Entrar na Fila")
    .setStyle("SUCCESS"),
  new MessageButton()
    .setCustomId("leave_queue_valorant")
    .setEmoji("❌")
    .setLabel("Sair da Fila")
    .setStyle("DANGER")
);
