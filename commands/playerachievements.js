const dc = require('discord.js');

exports.run = async (client, msg, args) => {
const playerID = Number(args[0]);
    async function fetchPlayer(playerID) {
        try {
            console.log(`PlayerAchievements | Fetching Player ID: ${playerID}`);
            const response = await fetch(`https://transfermarkt-api.fly.dev/players/${playerID}/achievements`);
            const data = await response.json();
            return data.achievements;
        } catch (error) {
            console.error("PlayerAchievements | Error:", error);
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
            paginatePlayers(msg, playerData);
            await loadingMessage.delete();
        } catch (error) {
            console.log("PlayerAchievements | Error: " + error.message);
        };
    };
    async function paginatePlayers(msg, players) {
        const chunks = sliceIntoChunks(players, 8);
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
    };
    function generateEmbed(player, page, totalPages) {
        const embed = new dc.EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Players Achievements (Page ${page + 1} of ${totalPages})`)
            .setTimestamp()
			.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});

        player.forEach(pdata => {
            const title = pdata.title || 'Unknown';
            const count = pdata.count || 'Unknown';
            embed.addFields(
                { name: 'Trophy:', value: title, inline: true },
                { name: 'Count:', value: count.toString(), inline: true },
                { name: '\u200B', value: '\u200B', inline: true}
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
    aliases: ['playerachievements', 'pa', 'playera'],
    permLevel: 0,
    kategori: 'Player'
};

module.exports.help = {
    name: 'playerachievements',
    description: 'Gives a listing of players achievements.',
    usage: 'playerachievements playerid'
};
