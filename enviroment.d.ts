declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      GUILD_ID: string;
      enviroment: "dev" | "prod";
    }
  }
}

export {};
