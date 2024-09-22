const dc = require('discord.js');

exports.run = async (client, msg, args) => {
    const playerID = Number(args[0]);
    async function fetchPlayer(playerID) {
        try {
            console.log(`PlayerInfo | Fetching Player ID: ${playerID}`);
            const response = await fetch(`https://transfermarkt-api.fly.dev/players/${playerID}/profile`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("PlayerInfo | Error:", error);
            throw error;
        }
    }
    function generateEmbed(playerInfo) {
    let playerName
    if(playerInfo.nameInHomeCountry){playerName = playerInfo.nameInHomeCountry}else if(!playerInfo.nameInHomeCountry){playerName = playerInfo.name};
        const embed = new dc.EmbedBuilder()
            .setColor(0x0099FF)
            .setThumbnail(`${playerInfo.imageURL}`)
            .setTitle(`${playerName}`)
            .setTimestamp()
			.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});
            embed.addFields(
                { name: 'Name:', value: playerInfo.name || "Unknown Name", inline: true },
				{ name: 'ID:', value: playerInfo.id || 'Unknown', inline: true },
				{ name: 'Description:', value: playerInfo.description || 'Unknown',},
            );
        return embed;
        
    }
async function fetchAndLogPlayer() {
        try {
            if (isNaN(playerID)) {
                return msg.channel.send("You need to write a player id. If you don't know player's id you could look it up by t!ps Player Name.");
            }
            let loadingMessage = await msg.channel.send('Loading data <a:loading:1287001854496215113>');
            const playerInfo = await fetchPlayer(playerID);
            if (playerInfo.details && playerInfo.details.includes('Client Error.')) {
                return msg.channel.send("There's no player like that bro.");
            }
            const embed = generateEmbed(playerInfo);
            msg.channel.send({ embeds: [embed] });
            await loadingMessage.delete();
        } catch (error) {
            console.log("TeamInfo | Error: " + error.message);
            msg.channel.send("Congrats! You just found an error.");
        }
    }
fetchAndLogPlayer();
};

module.exports.conf = {
    aliases: ['playerinfo', 'pi', 'playeri'],
    permLevel: 0,
    kategori: 'Player'
};

module.exports.help = {
    name: 'playerinfo',
    description: 'Gives info of a player.',
    usage: 'playerinfo playerid'
};