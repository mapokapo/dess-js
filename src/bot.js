require("dotenv").config();
const Commands = require("./commands/");

const { Client } = require("discord.js");
const client = new Client();

const prefix = "!";
client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const _args = message.content.slice(prefix.length).trim().split(/ +/);
  const _command = _args.shift().toLowerCase();
  if (!Commands.map(command => command.token).includes(_command)) {
    message.channel.send(`Unknown command: \`${_command}\``);
    return;
  }

  for (const command of Commands) {
    if (_command === command.token) {
      command.validate(message, _args).then(() => {
        command.execute(message, _args);
      }).catch(err => {
        message.channel.send(`**Error: ${err}.**`);
      });
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);