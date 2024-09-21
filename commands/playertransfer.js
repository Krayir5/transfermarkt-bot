const dc = require('discord.js');

exports.run = async (client, msg, args) => {
const playerID = Number(args[0]);
    async function fetchPlayer(playerID) {
        try {
            const response = await fetch(`https://transfermarkt-api.fly.dev/players/${playerID}/transfers`);
            const data = await response.json();
            return data.transfers;
        } catch (error) {
            console.error("PlayerTransfer | Error:", error);
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
            console.log("PlayerTransfer | Error: " + error.message);
        };
    };
    async function paginatePlayers(msg, players, loadingMessage) {
        const chunks = sliceIntoChunks(players, 3);
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
            .setTitle(`Player Transfers (Page ${page + 1} of ${totalPages})`)
            .setTimestamp()
			.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});

        player.forEach(pdata => {
            const from = pdata.from.clubName || 'Unknown';
			const to = pdata.to.clubName || 'Unknown';
            const date = pdata.date || 'Unknown';
            const season = pdata.season || 'Unknown';
            const marketValue = pdata.marketValue || 'Unknown';
            const fee = pdata.fee || 'Unknown';
            

            embed.addFields(
                { name: 'From:', value: from, inline: true },
                { name: 'To:', value: to, inline: true },
                { name: 'Date:', value: date, inline: true },
                { name: 'Season:', value: season, inline: true },
                { name: 'Market Value:', value: marketValue, inline: true },
				{ name: 'Fee:', value: fee, inline: true }
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
    aliases: ['playertransfer', 'pt', 'playert'],
    permLevel: 0,
    kategori: 'Player'
};

module.exports.help = {
    name: 'playertransfer',
    description: 'Gives a listing of players transfer.',
    usage: 'playertransfer playerid'
};
