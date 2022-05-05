import dotenv from "dotenv";
import { ExtendedClient } from "./structures/Client";
dotenv.config();

export const client = new ExtendedClient();

client.start();

client.on("debug", (...message) => console.log("debug", ...message));
client.on("warn", (...message) => console.warn("warn", ...message));
client.on("error", (...message) => console.error("error", ...message));
client.on("shardError", (...message) => console.log("shardError", ...message));
client.on("log", (...message) => console.log("log", ...message));
