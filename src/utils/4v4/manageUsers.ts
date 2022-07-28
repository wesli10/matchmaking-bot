import { fetchUsersFromCategory } from "../db";

export async function removeusersFromChannel(
  category_id,
  waiting_room_id,
  interaction
) {
  const users = await fetchUsersFromCategory("users_4v4", category_id);

  for (const user of users) {
    const member = await interaction.guild.members.fetch(user.user_id);
    await member.voice
      .setChannel(waiting_room_id)
      .catch((error) => console.log(error));
  }

  return;
}
