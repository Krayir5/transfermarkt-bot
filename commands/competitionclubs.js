const dc = require('discord.js');

exports.run = async (client, msg, args) => {
const competitionID = args[0];
let seasonID
    async function fetchClubs(competitionID, seasonID) {
        try {
            console.log(`CompetitionClubs | Fetching Competition ID: ${competitionID}, Season: ${seasonID}`);
            const response = await fetch(`https://transfermarkt-api.fly.dev/competitions/${competitionID}/clubs?season_id=${seasonID}`);
            const data = await response.json();
            return data.clubs;
        } catch (error) {
            console.error("CompetitionClubs | Error:", error);
            throw error;
        }
    }
    async function fetchAndLogClub() {
        try {
            if(!competitionID){
                return msg.channel.send("You need to write a competition id. If you don't know competition's id you could look it up by t!cs Competition Name");
            };
            if(!args[1]){seasonID = "2024"}else if(args[1]){seasonID = args[1]};
            let loadingMessage = await msg.channel.send('Loading data <a:loading:1287001854496215113>');
            const allClubs = await fetchClubs(competitionID, seasonID);
            if(allClubs.length === 0){
                await loadingMessage.delete();
                return msg.channel.send("There's no competition like that bro.");
            };
            console.log('going to paginate '+seasonID)
            paginateClubs(msg, allClubs, loadingMessage, seasonID);
        } catch (error) {
            console.log("CompetitionClubs | Error: " + error.message);
        };
    };
    async function paginateClubs(msg, clubs, loadingMessage, seasonID) {
        console.log('paginate '+seasonID)
        const chunks = sliceIntoChunks(clubs, 8);
        let currentPage = 0;
        const exampleEmbed = generateEmbed(chunks[currentPage], currentPage, chunks.length, seasonID);
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
            const newEmbed = generateEmbed(chunks[currentPage], currentPage, chunks.length, seasonID);
            sentEmbed.edit({ embeds: [newEmbed] });
            reaction.users.remove(user.id);
            });
            collector.on('end', () => {
                sentEmbed.reactions.removeAll();
            });
        });
        await loadingMessage.delete();
    };
    function generateEmbed(clubs, page, totalPages, seasonID) {
        let text
        console.log('embed '+seasonID)
        const embed = new dc.EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Clubs in season ${seasonID} (Page ${page + 1} of ${totalPages})`)
            .setTimestamp()
			.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});

        clubs.forEach(cdata => {
            const name = cdata.name || 'Unknown';
			const id = cdata.id || 'Unknown';

            embed.addFields(
                { name: 'Name:', value: name, inline: true },
				{ name: 'ID:', value: id, inline: true },
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
fetchAndLogClub();
};

module.exports.conf = {
    aliases: ['competitionclubs', 'cb', 'competitionb'],
    permLevel: 0,
    kategori: 'Competition'
};

module.exports.help = {
    name: 'competitionclubs',
    description: 'Gives a listing of competition clubs.',
    usage: 'competitionclubs competitionid'
};
