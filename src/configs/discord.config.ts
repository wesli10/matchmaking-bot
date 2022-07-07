export const DISCORD_CONFIG = {
  roles: {
    moderator: process.env.DISCORD_ROLE_MODERATOR,
    event: process.env.DISCORD_ROLE_EVENT,
    aux_event: process.env.DISCORD_ROLE_AUX_EVENT,
    admin: process.env.DISCORD_ROLE_ADMIN,
  },
  channels: {
    queue_room_id: process.env.DISCORD_CHANNEL_QUEUE_ROOM,
    waiting_room_id: process.env.DISCORD_CHANNEL_WAITING_ROOM,
  },
  numbers: {
    MIN_NUM_PLAYERS_TO_START_LOBBY:
      process.env.DISCORD_MIN_NUM_PLAYERS_TO_START_LOBBY,
    MIN_REACTION_TO_VOTE_END_MATCH:
      process.env.DISCORD_MIN_REACTION_TO_VOTE_END_MATCH,
    MIN_REACTION_TO_CONFIRM_MATCH:
      process.env.DISCORD_MIN_REACTION_TO_CONFIRM_MATCH,
    MIN_NUM_PLAYERS_TO_5v5_MATCH:
      process.env.DISCORD_MIN_NUM_PLAYERS_TO_5v5_MATCH,
    MIN_REACTION_TO_DRAW_MAP_AGAIN:
      process.env.DISCORD_MIN_REACTION_TO_DRAW_MAP_AGAIN,
    MIN_REACTION_TO_CONFIRM_MAP_VALORANT:
      process.env.DISCORD_MIN_REACTION_TO_CONFIRM_MAP_VALORANT,
    MIN_REACTION_TO_CONFIRM_MATCH_VALORANT:
      process.env.DISCORD_MIN_REACTION_TO_CONFIRM_MATCH_VALORANT,
    MIN_REACTION_TO_END_MATCH_VALORANT:
      process.env.DISCORD_MIN_REACTION_TO_END_MATCH_VALORANT,
  },
  mockAdminId: process.env.DISCORD_MOCK_ADMIN_ID,
};
