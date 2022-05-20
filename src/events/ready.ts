import { Event } from "../structures/Event";

export default new Event("ready", async (a) => {
  console.log("Ready!");
});
