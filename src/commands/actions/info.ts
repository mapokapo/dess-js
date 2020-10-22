import { ICommand } from "./../index";
import { CommandValidatorOptions } from "./../commandValidator";
import CommandValidator from "../commandValidator";
import { Message, MessageEmbed } from "discord.js";

import CommandInfo from "../commandInfo";
import config from "../../../config";

const infoOptions: CommandValidatorOptions = {
  token: "info",
};

const Command: ICommand = {
  validator: new CommandValidator(infoOptions),
  optValidator() {
    return new Promise((resolve) => resolve());
  },
  execute(_, message: Message) {
    const exampleEmbed = new MessageEmbed()
      .setColor("#7289DA")
      .setAuthor(
        "Dess",
        "https://i.imgur.com/4uupodX.png",
        "https://discord.js.org"
      )
      .setTitle("About Dess")
      .setURL("https://discord.js.org/")
      .setDescription(
        "Discord Essentials - An easy and intuitive server management bot."
      )
      .addField(
        "Currently available commands",
        `
          ${CommandInfo.map(
            (cmd) =>
              `**${cmd.token}** - ${cmd.description} \t (usage: \`${cmd.usage}\`)`
          ).join("\n")}
        `
      )
      .addFields(
        { name: "\u200b", value: "\u200b" },
        { name: "Author", value: `*${config.author}*`, inline: true },
        { name: "Version", value: `*${config.version}*`, inline: true }
      )
      .setFooter(
        `${message.author.username} ran !info`,
        message.author.avatarURL() || undefined
      )
      .setTimestamp();

    message.channel.send(exampleEmbed);
  },
};

export default Command;
