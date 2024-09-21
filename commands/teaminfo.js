const dc = require('discord.js');

exports.run = async (client, msg, args) => {
    const clubID = Number(args[0]);
    async function fetchClub(clubID) {
        try {
            const response = await fetch(`https://transfermarkt-api.fly.dev/clubs/${clubID}/profile`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("TeamInfo | Error:", error);
            throw error;
        }
    }
    function generateEmbed(clubInfo) {
        const embed = new dc.EmbedBuilder()
            .setColor(0x0099FF)
            .setThumbnail(`${clubInfo.image}`)
            .setTitle(`${clubInfo.officialName}`)
            .setTimestamp()
			.setFooter({text: `Requested by ${msg.author.username}`,iconURL: `${msg.author.displayAvatarURL()}`});
            const name = clubInfo.name || 'Unknown Name';
			const id = clubInfo.id || 'Unknown';
            const foundedOn = clubInfo.foundedOn || 'Unknown';
            const stadiumName = clubInfo.stadiumName || 'Unknown';
			const currentTransferRecord = clubInfo.currentTransferRecord || 'Unknown';
			const currentMarketValue = clubInfo.currentMarketValue || 'Unknown';
			const leagueID = clubInfo.league?.id || 'Unknown';
            const leagueName = clubInfo.league?.name || 'Unknown';
            const leagueTier = clubInfo.league?.tier || 'Unknown';

            embed.addFields(
                { name: 'Name:', value: name, inline: true },
				{ name: 'ID:', value: id, inline: true },
				{ name: 'Founded On:', value: foundedOn.toString(), inline: true },
				{ name: 'Stadium Name:', value: stadiumName, inline: true },
				{ name: 'Current Transfer Record:', value: currentTransferRecord.toString(), inline: true },
				{ name: 'Current Market Value:', value: currentMarketValue.toString(), inline: true },
                { name: 'League ID:', value: leagueID, inline: true },
                { name: 'League Name:', value: leagueName, inline: true },
                { name: 'League Tier:', value: leagueTier, inline: true },
            );
        return embed;
        
    }
async function fetchAndLogClub() {
        try {
            if (isNaN(clubID)) {
                return msg.channel.send("You need to write a club id. If you don't know club's id you could look it up by t!ts Team Name.");
            }
            const clubInfo = await fetchClub(clubID);
            if (clubInfo.details && clubInfo.details.includes('Client Error.')) {
                return msg.channel.send("There's no club like that bro.");
            }
            const embed = generateEmbed(clubInfo);
            msg.channel.send({ embeds: [embed] });
        } catch (error) {
            console.log("TeamInfo | Error: " + error.message);
            msg.channel.send("Congrats! You just found an error.");
        }
    }
fetchAndLogClub();
};

module.exports.conf = {
    aliases: ['teaminfo', 'ti', 'teami'],
    permLevel: 0,
    kategori: 'Team'
};

module.exports.help = {
    name: 'teaminfo',
    description: 'Gives info of an team.',
    usage: 'teaminfo teamid'
};