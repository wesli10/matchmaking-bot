export async function clear(interaction) {
  const fetched = await interaction.channel.messages.fetch({
    limit: 100,
  });
  if (interaction.channel.type === "DM") return;
  interaction.channel.bulkDelete(fetched);
}
