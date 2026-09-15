const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const { stripIndents } = require('common-tags');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelogs')
        .setDescription('View the most recent changes to Toastoku!'),
    
    async execute(interaction) {
        return interaction.reply({ content: `You can view the changelogs over on our [Dashboard](<https://www.gonoahwhere.com/toastoku/dashboard>)` })
    }
}