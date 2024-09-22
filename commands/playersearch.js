const dc = require('discord.js');

exports.run = async (client, msg, args) => {
    const playerName = args.join(" ");

    async function fetchPlayer(playerName) {
        try {
            console.log(`PlayerSearch | Fetching Player Name: ${playerName}`);
            const response = await fetch(`https://transfermarkt-api.fly.dev/players/search/${playerName}?page_number=1`);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error("PlayerSearch | Error:", error);
            throw error;
        }
    }

    async function fetchAndLogPlayer() {
        try {
            if (playerName.length === 0) {
                return msg.channel.send('You need to write a club to get a club duh. Example: t!ts Team Name');
            }
            let loadingMessage = await msg.channel.send('Loading data <a:loading:1287001854496215113>');
            const playerSearch = await fetchPlayer(playerName);
            if (playerSearch.length === 0) {
                return msg.channel.send("There's no player like that bro.");
            }
            paginatePlayers(msg, playerSearch);
            await loadingMessage.delete();
        } catch (error) {
            console.log("PlayerSearch | Error: " + error.message);
            msg.channel.send("Congrats! You just found an error.");
        }
    }

   async function paginatePlayers(msg, players) {
        const chunks = sliceIntoChunks(players, 3);
        let currentPage = 0;
        const exampleEmbed = generateEmbed(chunks[currentPage], currentPage, chunks.length);
        if (chunks.length === 1) {
            return msg.channel.send({ embeds: [exampleEmbed] });
        }
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
    }
    function generateEmbed(playerSearch, page, totalPages) {
        const embed = new dc.EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Search Result for ${playerName} (Page ${page + 1} of ${totalPages})`)
            .setTimestamp()
			.setFooter({ text: `Requested by ${msg.author.username}`, iconURL: `${msg.author.displayAvatarURL()}` });
        playerSearch.forEach(pdata => {
            const name = pdata.name || 'Unknown';
            const id = pdata.id || 'Unknown';
            const club = pdata.club.name || 'Unknown';
            const position = pdata.position || 'Unknown';
            const nationality = pdata.nationalities.join(", ") || 'Unknown';
            let marketValue;
            if(pdata.marketValue === "-"){marketValue = "Retired";}else if(!pdata.marketValue){marketValue = "Unknown"}else if(pdata.marketValue){marketValue = pdata.marketValue;}

            embed.addFields(
                { name: 'Name:', value: name, inline: true },
				{ name: 'ID:', value: id, inline: true },
				{ name: 'Club:', value: club, inline: true },
                { name: 'Position:', value: position, inline: true },
				{ name: 'Nationalities:', value: nationality, inline: true },
				{ name: 'Market Value:', value: marketValue, inline: true }
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
    aliases: ['playersearch', 'ps', 'players'],
    permLevel: 0,
    kategori: 'Player'
};

module.exports.help = {
    name: 'playersearch',
    description: 'Gives a listing of teams.',
    usage: 'playersearch Player Name'
};
