const dc = require('discord.js');

exports.run = async (client, msg, args) => {
const playerID = Number(args[0]);
let pageID, loadingMessage
    async function fetchPlayer(playerID, pageID) {
        try {
            console.log(`PlayerInjury | Fetching Player ID: ${playerID}`);
            const response = await fetch(`https://transfermarkt-api.fly.dev/players/${playerID}/injuries?page_number=${pageID}`);
            const data = await response.json();
            return data.injuries;
        } catch (error) {
            console.error("PlayerInjury | Error:", error);
            throw error;
        }
    }
    async function fetchAndLogPlayer() {
        try {
            if (!playerID) {
                return msg.channel.send("You need to write a player id. If you don't know player's id you could look it up by t!ps Player Name");
            };
            if (!args[1]){pageID = "1"}else if(args[1]){pageID = args[1]};
            loadingMessage = await msg.channel.send('Loading data <a:loading:1287001854496215113>');
            const playerData = await fetchPlayer(playerID, pageID);
            if (playerData.length === 0) {
                await loadingMessage.delete();
                return msg.channel.send("There's no player like that bro.");
            };
            paginatePlayers(msg, playerData);
        } catch (error) {
            console.log("PlayerInjury | Error: " + error.message);
        };
    };
    async function paginatePlayers(msg, players) {
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
            .setTitle(`Players Injuries API Page ${pageID} (Embed Page ${page + 1} of ${totalPages})`)
            .setTimestamp()
			.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});

        player.forEach(pdata => {
            const seasonID = pdata.season || 'Unknown';
            const injury = pdata.injury || 'Unknown';
            const from = pdata.from || 'Unknown';
            const until = pdata.until || 'Unknown';
            const days = pdata.days || 'Unknown';
            const gamesMiseed = pdata.gamesMissed || 'Unknown';
            embed.addFields(
                { name: 'Injury:', value: injury, inline: true },
                { name: 'Games Missed:', value: gamesMiseed, inline: true },
                { name: 'Season:', value: seasonID, inline: true },
                { name: 'From:', value: from, inline: true },
				{ name: 'Until:', value: until, inline: true },
                { name: 'Days:', value: days, inline: true }
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
    aliases: ['playerinjury', 'pin', 'playersin'],
    permLevel: 0,
    kategori: 'Player'
};

module.exports.help = {
    name: 'playerinjury',
    description: 'Gives a listing of players statistics.',
    usage: 'playerinjury playerid pageid'
};
