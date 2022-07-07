import { confirm_message } from "./4v4/messageInteractionsTemplates";
import { createActionAndMessage } from "./db";

export async function confirm_participateFunc(textChatAnnouncements) {
  const channel = textChatAnnouncements;
  if (channel.type !== "GUILD_TEXT") {
    return;
  }

  const message_confirm = await channel.send({
    embeds: [confirm_message],
  });

  message_confirm.react("👍");

  await createActionAndMessage(message_confirm.id, "confirm_presence");
}
