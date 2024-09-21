const client = require("../markt");
const { Collection } = require("discord.js")
const fs = require("fs")


client.commands = new Collection();
client.aliases = new Collection();
fs.readdir("./commands/", (err, files) => {
if (err) console.error(err);
files.forEach(f => {
let props = require(`../commands/${f}`);
    
client.on('ready', () => { 
client.user.setPresence({ activities: [{ name: 'MarktBot' }] });
client.commands.set(props.help.name, props);
props.conf.aliases.forEach(alias => {
client.aliases.set(alias, props.help.name);
});
});
});
});