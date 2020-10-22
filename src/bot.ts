import { GuildMember } from "discord.js";
// Secrets
import dotenv from "dotenv";
dotenv.config();

// Main client
import { Client, TextChannel } from "discord.js";
const client = new Client();

// CUSTOM
// List of command objects
import Commands from "./commands";
// Package config
import config from "../config";
import { ordinal } from "./utils";

// Main command listener
client.on("message", (message) => {
  if (
    !message.content.startsWith(config.prefix) ||
    message.author.bot ||
    !message.guild
  )
    return;

  const _args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const _command = (_args.shift() || "none").toLowerCase();
  if (_command === "none") return;
  if (!Commands.map((command) => command.validator.token).includes(_command)) {
    message.channel.send(`**Error: Unknown command: \`${_command}\`**`);
    return;
  }

  for (const command of Commands) {
    if (_command === command.validator.token) {
      command.validator
        .validate(_args, message)
        .then(() => {
          command
            .optValidator(_args, message)
            .then(() => {
              command.execute(
                _args,
                message,
                command.validator.token === "prefix"
                  ? (p: string) => (config.prefix = p)
                  : undefined // This is ugly
              );
            })
            .catch((err) => {
              message.channel.send(`**Error: ${err}.**`);
            });
        })
        .catch((err) => {
          message.channel.send(`**Validation error: ${err}.**`);
        });
    }
  }
});

client.on("guildMemberAdd", (_member) => {
  setTimeout(() => {
    const member = _member as GuildMember;
    const channel = client.channels.cache.get(
      process.env.ULLAPOOL_SERMVER_SYSTEM_CHANNEL_ID!
    )! as TextChannel;
    channel.send(
      `**Welcome <@${member.user.id}>! You are the ${ordinal(
        client.guilds.cache.get(process.env.ULLAPOOL_SERMVER_ID!)!.memberCount
      )} member of ulla's server!**`
    );
  }, 1000);
});

client.login(process.env.DISCORDJS_BOT_TOKEN!);
