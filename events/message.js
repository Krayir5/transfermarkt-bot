const { EmbedBuilder } = require("discord.js");
var settings = require("../settings.json");
const client = require("../markt");
const prefix = settings.prefix;
const cooldowns = new Map();

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  let command = message.content.toLocaleLowerCase().split(" ")[0].slice(prefix.length);
  let params = message.content.split(" ").slice(1);
  let cmd;
  if (!cooldowns.has(command)) {
    cooldowns.set(command, new Map());
  }
  const time = Date.now();
  const timestamps = cooldowns.get(command);
  if (timestamps) {
    const uC = timestamps.get(message.author.id);
    if (uC && (time - uC) < 10000) {
      const remainingTime = Math.ceil((10000 - (time - uC)) / 1000);
      const cooldownMessage = await message.reply(`You need to wait **${remainingTime}** seconds to use this command.`);
      setTimeout(() => cooldownMessage.delete(), 2000);
      return;
    }
  }
  timestamps.set(message.author.id, time);
  if (client.commands.has(command)) {cmd = client.commands.get(command);} 
  else if (client.aliases.has(command)) {cmd = client.commands.get(client.aliases.get(command));}
  if (cmd) {cmd.run(client, message, params);}
  setTimeout(() => timestamps.delete(message.author.id), 10000);
});
