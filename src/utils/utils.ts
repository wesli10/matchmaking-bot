export async function clear(interaction, qtd) {
  const fetched = await interaction.channel.messages.fetch({
    limit: qtd,
  });
  if (interaction.channel.type === "DM") return;
  interaction.channel.bulkDelete(fetched);
}
