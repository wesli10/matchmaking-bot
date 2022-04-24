export async function clear(interaction) {
  const fetched = await interaction.channel.messages.fetch({
    limit: 1,
  });
  if (interaction.channel.type === "DM") return;
  interaction.channel.bulkDelete(fetched);
}
