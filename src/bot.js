require("dotenv").config();

const { Client } = require("discord.js");
const client = new Client();

const Commands = require("./commands/");
const config = require("../config");

client.on("message", (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const _args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const _command = _args.shift().toLowerCase();
  if (!_command) return;
  if (!Commands.map(command => command.validator.token).includes(_command)) {
    message.channel.send(`**Error: Unknown command: \`${_command}\`**`);
    return;
  }

  for (const command of Commands) {
    if (_command === command.validator.token) {
      command.validator.validate(_args, message).then(() => {
        if (command.optValidator) {
          command.optValidator(_args, message).then(() => {
            command.execute(
              _args,
              message,
              command.validator.token === "prefix" ? (p) => config.prefix = p : undefined // This is ugly
            );
          }).catch(err => {
            message.channel.send(`**Error: ${err}.**`);
          });
        } else {
          command.execute(
            _args,
            message,
            command.validator.token === "prefix" ? (p) => config.prefix = p : undefined // This is ugly
          );
        }
      }).catch(err => {
        message.channel.send(`**Error: ${err}.**`);
      });
    }
  }
});

const ordinal = number => {
  if (number <= 0) return number.toString();
  const suffixes = ["st", "nd", "rd"];
  const index = number - 1;
  if (index > suffixes.length - 1) return number + "th";
  return number + suffixes[index];
}

client.on("guildMemberAdd", member => {
  setTimeout(() => {
    client.channels.cache.get(process.env.ULLAPOOL_SERMVER_SYSTEM_CHANNEL_ID)
      .send(`**Welcome <@${member.user.id}>! You are the ${ordinal(client.guilds.cache.get(process.env.ULLAPOOL_SERMVER_ID).memberCount)} member of ulla's server!**`);
  }, 1000);
});

client.login(process.env.DISCORDJS_BOT_TOKEN);