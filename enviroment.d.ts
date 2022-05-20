declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      GUILD_ID: string;
      enviroment: "development" | "production";
    }
  }
}

export {};
