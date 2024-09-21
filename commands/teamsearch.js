const dc = require('discord.js');

exports.run = async (client, msg, args) => {
    const clubName = args.join(" ");

    async function fetchClub(clubName) {
        try {
            const response = await fetch(`https://transfermarkt-api.fly.dev/clubs/search/${clubName}?page_number=1`);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error("TeamSearch | Error:", error);
            throw error;
        }
    }

    async function fetchAndLogClub() {
        try {
            if (clubName.length === 0) {
                return msg.channel.send('You need to write a club to get a club duh. Example: t!ts Team Name');
            }
            let loadingMessage = await msg.channel.send('Loading data <a:loading:1287001854496215113>');
            const clubSearch = await fetchClub(clubName);
            if (clubSearch.length === 0) {
                return msg.channel.send("There's no club like that bro.");
            }
            paginateClubs(msg, clubSearch);
            await loadingMessage.delete();
        } catch (error) {
            console.log("TeamSearch | Error: " + error.message);
            msg.channel.send("Congrats! You just found an error.");
        }
    }

 async  function paginateClubs(msg, clubs) {
        const chunks = sliceIntoChunks(clubs, 5);
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
                if(user.id === message.author.id){                
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
    function generateEmbed(clubSearch, page, totalPages) {
        const embed = new dc.EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Search Result for ${clubName} (Page ${page + 1} of ${totalPages})`)
            .setTimestamp()
			.setFooter({ text: `Requested by ${msg.author.username}`, iconURL: `${msg.author.displayAvatarURL()}` });
        clubSearch.forEach(clubData => {
            const name = clubData.name || 'Unknown';
            const id = clubData.id || 'Unknown';
            const country = clubData.country || 'Unknown';

            embed.addFields(
                { name: 'Name:', value: name, inline: true },
				{ name: 'ID:', value: id, inline: true },
				{ name: 'Country:', value: country, inline: true }
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
    aliases: ['teamsearch', 'ts', 'teams'],
    permLevel: 0,
    kategori: 'Team'
};

module.exports.help = {
    name: 'teamsearch',
    description: 'Gives a listing of teams.',
    usage: 'teamsearch teamname'
};
