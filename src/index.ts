import dotenv from "dotenv";
import { collectDefaultMetrics, Registry } from "prom-client";
import { ExtendedClient } from "./structures/Client";
import express from "express";
import { removeUser } from "./utils/db";
import { globalReactions } from "./utils/reactions";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
Tracing.addExtensionMethods();

const server = express();

global.raceStartLobby = false;

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

client.on("messageReactionAdd", globalReactions);

server.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    emitSentry("/metrics", "Error on trying to fetch metrics", ex);
    res.status(500).end(ex);
  }
});

const port = process.env.PORT || 3000;
console.log(
  `Server listening to ${port}, metrics exposed on /metrics endpoint`
);
server.listen(port);

// Sentry Logging Initialization
Sentry.init({
  dsn: process.env.SENTRY_URL_DSN,
  tracesSampleRate: 1.0,
});

export const emitSentry = (operation, description, exception) => {
  const transaction = Sentry.startTransaction({
    op: operation,
    name: description,
  });

  Sentry.captureException(exception);
  transaction.finish();
};
