export const DISCORD_ENV_CONFIG = {
  production: {
    roles: {
      moderator: "945293155866148914",
      event: "958065673156841612",
      aux_event: "968697582706651188",
    },
    channels: {
      queue_room_id: "968922689190371328",
    },
    numbers: {
      MIN_NUM_PLAYERS_TO_START_LOBBY: 8,
      MIN_REACTION_TO_VOTE_END_MATCH: 6,
    },
  },

  development: {
    roles: {
      moderator: "945293155866148914",
      event: "593658220753453056",
      aux_event: "968697582706651188",
      admin: "977262483918163999",
    },
    channels: {
      queue_room_id: "977264480943747093",
    },
    numbers: {
      MIN_NUM_PLAYERS_TO_START_LOBBY: 8,
      MIN_REACTION_TO_VOTE_END_MATCH: 6,
    },
  },
};

export const DISCORD_CONFIG: typeof DISCORD_ENV_CONFIG["development"] =
  DISCORD_ENV_CONFIG[process.env.NODE_ENV];
