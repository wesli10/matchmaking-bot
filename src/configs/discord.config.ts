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
  },
};
