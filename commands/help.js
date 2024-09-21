const dc = require('discord.js')
const settings = require('../settings.json') 

exports.run = async (client, msg, args) => {
    var prefix = settings.prefix;
if(args[0] === "Competition" || args[0] === "competition" || args[0] === "c") {
let Competition = new dc.EmbedBuilder()
.setAuthor({ name: 'Competition Category', iconURL: `${msg.author.displayAvatarURL()}`,})
.setDescription(client.commands.filter(cmd => cmd.conf.kategori === 'Competition').map(cmd => `<:online:1287008334095974452> **${prefix}${cmd.help.name}** ${cmd.help.description}`).join("\n "))
.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});
return msg.channel.send({embeds : [Competition]});
} 

if(args[0] === "Team" || args[0] === "team" || args[0] === "t") {
let Team = new dc.EmbedBuilder()
.setAuthor({ name: 'Team Category', iconURL: `${msg.author.displayAvatarURL()}`,})
.setDescription(client.commands.filter(cmd => cmd.conf.kategori === 'Team').map(cmd => `<:online:1287008334095974452> **${prefix}${cmd.help.name}** ${cmd.help.description}`).join("\n "))
.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});
return msg.channel.send({embeds : [Team]});
} 

if(args[0] === "Player" || args[0] === "player" || args[0] === "p") {
let Team = new dc.EmbedBuilder()
.setAuthor({ name: 'Player Category', iconURL: `${msg.author.displayAvatarURL()}`,})
.setDescription(client.commands.filter(cmd => cmd.conf.kategori === 'Player').map(cmd => `<:online:1287008334095974452> **${prefix}${cmd.help.name}** ${cmd.help.description}`).join("\n "))
.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});
return msg.channel.send({embeds : [Team]});
} 


  let embed = new dc.EmbedBuilder()
  .setAuthor({ name: 'Help', iconURL: `${msg.author.displayAvatarURL()}`,})
  .setDescription(`**Categories**`)
	.addFields(
    { name: `${prefix}help Competition`, value: 'Competition commands', inline: false },
		{ name: `${prefix}help Team`, value: 'Team commands', inline: false },
    { name: `${prefix}help Player`, value: 'Player commands', inline: false },
  )
  .setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});
  return msg.channel.send({embeds : [embed]});
}
  exports.conf = {
    aliases: ['help'],
    permLevel: 0,
    kategori: "Help"

  };

  exports.help = {
    name: 'help',
    description: 'Gives you information about commands.',
    usage: 'help category',
  };