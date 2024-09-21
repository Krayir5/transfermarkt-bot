const dc = require('discord.js')
const settings = require('../settings.json') 

exports.run = async (client, msg, args) => {
    var prefix = settings.prefix;
    if(args[0] === "Team" || args[0] === "team" || args[0] === "t") {
              let Genel = new dc.EmbedBuilder()
              .setAuthor({ name: 'Team Category', iconURL: `${msg.author.displayAvatarURL()}`,})
              .setDescription(client.commands.filter(cmd => cmd.conf.kategori === 'Team').map(cmd => `<:online:1287008334095974452> **${prefix}${cmd.help.name}** ${cmd.help.description}`).join("\n "))
              .setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});
        return msg.channel.send({embeds : [Genel]});
         
       
       return;
    } 
  let embed = new dc.EmbedBuilder()
  .setAuthor({ name: 'Help', iconURL: `${msg.author.displayAvatarURL()}`,})
  .setDescription(`**Categories**`)
	.addFields(
		{ name: `${prefix}help Team`, value: 'Team commands', inline: false },
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