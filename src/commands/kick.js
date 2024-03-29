const { CommandValidator } = require("../commandValidator");

const kickOptions = {
  token: "kick",
  args: [
    {
      name: "user",
      type: "string",
      required: true
    },
    {
      name: "reason",
      type: "any",
      multi: true // Must be last items in args array in order to have `multi` property (any overflow tokens are added to an array, in this case the `reason` attribute)
    }
  ]
};

function getUserFromMention(mention, message) {
  if (!mention) return;

  if (mention.startsWith('<@') && mention.endsWith('>')) {
    mention = mention.slice(2, -1);

    if (mention.startsWith('!')) {
      mention = mention.slice(1);
    }

    return message.guild.members.cache.get(mention);
  }
}

module.exports = {
  validator: new CommandValidator(kickOptions),
  optValidator(args, message) {
    return new Promise((resolve, reject) => {
      const mentionsUser = ((/^<@!?\d+>$/.test(args[0]) && message.mentions.members.size !== 0));

      if (mentionsUser) {
        if (!args[0].includes(message.mentions.members.first().id.toString())) return reject(`User \`${args[0]}\` not found`);
      } else {
        return reject(`You must \`@mention\` a user`);
      }

      const user = message.guild.member(args[0].match(/\d+/)[0]);
      if (!message.guild.member(args[0].match(/\d+/)[0]).kickable) {
        return reject(`You cannot kick \`${user.user.username}\``);
      }

      resolve();
    });
  },
  execute(args, message) {
    const user = message.guild.member(args[0].match(/\d+/)[0]);
    const reason = args.slice(1, args.length).map(str => {
      if (/^<@!?\d+>$/.test(str)) {
        const member = getUserFromMention(str, message);
        return member.user.tag;
      } else if (/^<#\d+>$/.test(str)) {
        return "#" + message.guild.channels.cache.get(str.slice(2, str.length - 1)).name;
      } else if (/^<@&\d+>$/.test(str)) {
        return "@" + message.guild.roles.cache.get(str.slice(3, str.length - 1)).name;
      } else {
        return str;
      }
    }).join(" ") || "Kicked by admin";
    user.kick(reason).then((guildMember) => {
      message.channel.send(`**Kicked user \`${guildMember.user.username}\`, reason: \`${reason}\`**`);
    });
  }
};