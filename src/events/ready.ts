import { Event } from "../structures/Event";
import { db, fetchUsers, createUserQueue } from "../utils/db";

export default new Event("ready", async () => {});
