const { CommandValidator } = require("../commandValidator");
const { MessageEmbed } = require("discord.js");

const CommandInfo = require("./commandInfo");
const config = require("../../config");

const infoOptions = {
  token: "info"
}

module.exports = {
  validator: new CommandValidator(infoOptions),
  execute(_, message) {
    const exampleEmbed = new MessageEmbed()
      .setColor("#7289DA")
      .setAuthor("Dess", "https://i.imgur.com/4uupodX.png", "https://discord.js.org")
      .setTitle("About Dess")
      .setURL("https://discord.js.org/")
      .setDescription("Discord Essentials - An easy and intuitive server management bot.")
      .addField(
        "Currently available commands",
        `
          ${CommandInfo.map(cmd => `**${cmd.token}** - ${cmd.description} \t (usage: \`${cmd.usage}\`)`).join("\n")}
        `
      )
      .addFields(
        { name: '\u200b', value: '\u200b' },
        { name: "Author", value: `*${config.author}*`, inline: true },
        { name: "Version", value: `*${config.version}*`, inline: true },
      )
      .setFooter(`${message.author.username} ran !info`, message.author.avatarURL())
      .setTimestamp();

    message.channel.send(exampleEmbed);
  }
};