import { Event } from "../structures/Event";

export default new Event("ready", async () => {
  console.log("Ready!");
});
