const dc = require('discord.js');

exports.run = async (client, msg, args) => {
const playerID = Number(args[0]);
    async function fetchPlayer(playerID) {
        try {
            console.log(`PlayerStats | Fetching Player ID: ${playerID}`);
            const response = await fetch(`https://transfermarkt-api.fly.dev/players/${playerID}/stats`);
            const data = await response.json();
            return data.stats;
        } catch (error) {
            console.error("PlayerStats | Error:", error);
            throw error;
        }
    }
    async function fetchAndLogPlayer() {
        try {
            if (!playerID) {
                return msg.channel.send("You need to write a player id. If you don't know player's id you could look it up by t!ps Player Name");
            };
            let loadingMessage = await msg.channel.send('Loading data <a:loading:1287001854496215113>');
            const playerData = await fetchPlayer(playerID);
            if (playerData.length === 0) {
                await loadingMessage.delete();
                return msg.channel.send("There's no player like that bro.");
            };
            paginatePlayers(msg, playerData, loadingMessage);
        } catch (error) {
            console.log("PlayerStats | Error: " + error.message);
        };
    };
    async function paginatePlayers(msg, players, loadingMessage) {
        const chunks = sliceIntoChunks(players, 2);
        let currentPage = 0;
        const exampleEmbed = generateEmbed(chunks[currentPage], currentPage, chunks.length);
        if (chunks.length === 1) {return msg.channel.send({ embeds: [exampleEmbed] })};
        msg.channel.send({ embeds: [exampleEmbed] }).then(sentEmbed => {
            sentEmbed.react('<:arrowleft:1286761260939083817>');
            sentEmbed.react('<:arrowright:1286761277406056448>');
            const filter = (reaction, user) => ['arrowleft', 'arrowright'].includes(reaction.emoji.name) && !user.bot;
            const collector = sentEmbed.createReactionCollector({ filter, time: 90000 });
            collector.on('collect', (reaction, user) => {
                if(user.id === msg.author.id){                
                    if (reaction.emoji.name === 'arrowright'){
                    if (currentPage < chunks.length - 1) {
                        currentPage++;
                    }
                }else if(reaction.emoji.name === 'arrowleft'){
                    if (currentPage > 0) {
                        currentPage--;
                    }
                }};
            const newEmbed = generateEmbed(chunks[currentPage], currentPage, chunks.length);
            sentEmbed.edit({ embeds: [newEmbed] });
            reaction.users.remove(user.id);
            });
            collector.on('end', () => {
                sentEmbed.reactions.removeAll();
            });
        });
        await loadingMessage.delete();
    };
    function generateEmbed(player, page, totalPages) {
        const embed = new dc.EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Players Statistic (Page ${page + 1} of ${totalPages})`)
            .setTimestamp()
			.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});

        player.forEach(pdata => {
            const clubID = pdata.clubID || 'Unknown';
			const seasonID = pdata.seasonID || 'Unknown';
            const competitionName = pdata.competitionName || 'Unknown';
            const appearances = pdata.appearances || 'Unknown';
            const minutesPlayed = pdata.minutesPlayed || 'Unknown';
            let goals, assists, yellowCards, redCards
            if(pdata.goals){goals = pdata.goals}else if(!pdata.goals){goals = "0"};
            if(pdata.assists){assists = pdata.assists}else if(!pdata.assists){assists = "0"};
            if(pdata.yellowCards){yellowCards = pdata.yellowCards}else if(!pdata.yellowCards){yellowCards = "0"};
            if(pdata.redCards){redCards = pdata.redCards}else if(!pdata.redCards){redCards = "0"};
            embed.addFields(
                { name: 'Club ID:', value: clubID, inline: true },
                { name: 'Competition Name:', value: competitionName, inline: true },
                { name: 'Season:', value: seasonID, inline: true },
                { name: 'Appearances:', value: appearances, inline: true },
                { name: 'Goals:', value: goals, inline: true },
                { name: 'Assists:', value: assists, inline: true },
				{ name: 'Minutes Played:', value: minutesPlayed, inline: true },
                { name: 'Yellow Cards:', value: yellowCards, inline: true },
                { name: 'Red Cards:', value: redCards, inline: true },
                { name: '\u200B', value: '\u200B' }
            );
			
        });

        return embed;
    }
    function sliceIntoChunks(arr, chunkSize) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }
fetchAndLogPlayer();
};

module.exports.conf = {
    aliases: ['playerstats', 'pst', 'playerst'],
    permLevel: 0,
    kategori: 'Player'
};

module.exports.help = {
    name: 'playerstats',
    description: 'Gives a listing of players statistics.',
    usage: 'playerstats playerid'
};
