const dc = require('discord.js');

exports.run = async (client, msg, args) => {
const clubID = Number(args[0]);
let seasonID
    async function fetchPlayers(clubID) {
        try {
            console.log(`TeamPlayers | Fetching Team ID: ${clubID}, Season: ${seasonID}`);
            const response = await fetch(`https://transfermarkt-api.fly.dev/clubs/${clubID}/players?season_id=${seasonID}`);
            const data = await response.json();
            return data.players;
        } catch (error) {
            console.error("TeamPlayers | Error:", error);
            throw error;
        }
    }
    async function fetchAndLogPlayers() {
        try {
            if (isNaN(clubID)) {
                return msg.channel.send("You need to write a club id. If you don't know club's id you could look it up by t!ts Team Name");
            };
            if (!args[1]) {seasonID = "2024"}else if(args[1]){seasonID = args[1]};
            let loadingMessage = await msg.channel.send('Loading data <a:loading:1287001854496215113>');
            const allPlayers = await fetchPlayers(clubID);
            if (allPlayers.length === 0) {
                return msg.channel.send("There's no club like that bro.");
            };
            paginatePlayers(msg, allPlayers, loadingMessage);
        } catch (error) {
            console.log("TeamPlayers | Error: " + error.message);
        };
    };
    async function paginatePlayers(msg, players, loadingMessage) {
        const chunks = sliceIntoChunks(players, 2);
        let currentPage = 0;
        const exampleEmbed = generateEmbed(chunks[currentPage], currentPage, chunks.length);
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
    function generateEmbed(players, page, totalPages) {
        const embed = new dc.EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Team Players in season ${seasonID} (Page ${page + 1} of ${totalPages})`)
            .setTimestamp()
			.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});

        players.forEach(player => {
            const name = player.name || 'Unknown';
			const id = player.id || 'Unknown';
            const position = player.position || 'Unknown';
            const age = player.age || 'Unknown';
			const height = player.height || 'Unknown';
			let signedFrom = player.signedFrom || 'Unknown';
            if(signedFrom.includes(": Ablöse")) {
                signedFrom = signedFrom.replace(": Ablöse", "Free Agent");
            }
            let contract
            if(player.contract){
            contract = player.contract;
            }else if(player.currentClub === "Retired"){
            contract = player.currentClub;
            }else if(!player.contract){
            contract = `Moved to ${player.currentClub}`;
            }
            const marketValue = player.marketValue || 'Unknown';
            const nationality = player.nationality.join(", ") || 'Unknown';

            embed.addFields(
                { name: 'Name:', value: name, inline: true },
				{ name: 'ID:', value: id, inline: true },
				{ name: 'Nationality(s):', value: nationality, inline: true },
				{ name: 'Age:', value: age.toString(), inline: true },
				{ name: 'Height:', value: height.toString(), inline: true },
				{ name: 'Position:', value: position, inline: true },
				{ name: 'Signed From:', value: signedFrom, inline: true },
                { name: 'Contract:', value: contract, inline: true },
                { name: 'Market Value:', value: marketValue.toString(), inline: true },
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
fetchAndLogPlayers();
};

module.exports.conf = {
    aliases: ['teamplayers', 'tp', 'teamp'],
    permLevel: 0,
    kategori: 'Team'
};

module.exports.help = {
    name: 'teamplayers',
    description: 'A list of teamplayes.',
    usage: 'teamplayers teamid season'
};
