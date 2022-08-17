import {
  ApplicationCommandDataResolvable,
  Client,
  Collection,
  ClientEvents,
} from "discord.js";
import { CommandType } from "../typings/Command";
import glob from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./Event";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { verifyRole } from "../utils/verified";
dotenv.config();

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();

  constructor() {
    super({ intents: 32767, partials: ["MESSAGE", "CHANNEL", "REACTION"] });
  }

  start() {
    this.registerModules();
    this.login(process.env.BOT_TOKEN);
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
    } else {
      this.application?.commands.set(commands);
    }
  }

  async registerModules() {
    // Commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await globPromise(
      `${__dirname}/../commands/*/*{.ts,.js}`
    );
    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;

      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    this.on("ready", () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: process.env.GUILD_ID,
      });
    });

    this.on("guildMemberAdd", async (member) => {
      const verifiedGuild = process.env.DISCORD_VERIFIED_GUILD;
      const verifielRole = process.env.DISCORD_VERIFIED_ROLE_ID;
      const playerRoleId = process.env.DISCORD_PLAYER_ROLE_ID;

      const guild = this.guilds.cache.get(verifiedGuild);

      if (!guild) {
        return;
      }

      try {
        const membro = guild.members.cache.get(member.user.id);
        const hasRole = membro.roles.cache.has(verifielRole);

        if (hasRole) {
          try {
            const guildInHouse = this.guilds.cache.get(member.guild.id);
            const memberInHouse = guildInHouse.members.cache.get(
              member.user.id
            );

            await memberInHouse.roles.add(playerRoleId);
          } catch (error) {
            console.log(error);
          }
          return;
        } else {
          return;
        }
      } catch (error) {
        console.log(error);
      }
    });
    // Event
    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);

    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      this.on(event.event, event.run);
    });
  }

  connectToDataBase() {
    const options = {
      schema: "public",
      headers: { "x-my-custom-header": "my-app-name" },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    };
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      options
    );
    return supabase;
  }

  // // DB DEV
  // connectToDataBase() {
  //   const options = {
  //     schema: "public",
  //     headers: { "x-my-custom-header": "my-app-name" },
  //     autoRefreshToken: true,
  //     persistSession: true,
  //     detectSessionInUrl: true,
  //   };
  //   const supabase = createClient(
  //     process.env.SUPABASE_URL,
  //     process.env.SUPABASE_KEY,
  //     options
  //   );
  //   return supabase;
  // }
}
