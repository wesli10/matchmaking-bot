import dotenv from "dotenv";
import { collectDefaultMetrics, Registry } from "prom-client";
import { ExtendedClient } from "./structures/Client";
import express from "express";
import { removeUser } from "./utils/db";
const server = express();

dotenv.config();

const register = new Registry();
collectDefaultMetrics({ register });

export const client = new ExtendedClient();

client.start();

client.on("debug", (...message) => console.log("debug", ...message));
client.on("warn", (...message) => console.warn("warn", ...message));
client.on("error", (...message) => console.error("error", ...message));
client.on("shardError", (...message) => console.log("shardError", ...message));
client.on("log", (...message) => console.log("log", ...message));

client.on("guildMemberRemove", async (member) => {
  await removeUser("users", member.id);
  await removeUser("users_4v4", member.id);
});

server.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

const port = process.env.PORT || 3000;
console.log(
  `Server listening to ${port}, metrics exposed on /metrics endpoint`
);
server.listen(port);
