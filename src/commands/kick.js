module.exports = {
  token: "kick",
  args: [
    {
      name: "user",
      type: "string",
      required: true
    },
    {
      name: "reason",
      type: "any"
    }
  ],
  validate(message, args) {
    function ordinal(number) {
      if (number === 1) {
        return "1st";
      } else if (number === 2) {
        return "2nd";
      } else if (number === 3) {
        return "3rd";
      } else {
        return number + "th";
      }
    }

    return new Promise((resolve, reject) => {
      if (args.length < this.args.filter(arg => arg.required === true).length) return reject(`Too few arguments supplied: (\`${args.length || "none"}\`), required: \`${this.args.map(arg => arg.name).join(", ")}\``);
      if (args.length > this.args.length) return reject(`Too many arguments supplied (\`${args.length}\`), required: \`${this.args.map(arg => arg.name).join(", ")}\``);
      for (const argIndex in args) {
        let argType = "string";
        if (!isNaN(parseFloat(args[argIndex]))) {
          argType = "number";
        }

        if (this.args[argIndex].type !== "any") {
          if (argType !== this.args[argIndex].type) return reject(`The ${ordinal(parseInt(argIndex) + 1)} argument \`${args[argIndex]}\` is not of type \`${this.args[argIndex].type}\``);
        }
      }

      const mentionsUser = (message.mentions.members.size !== 0 && message.mentions.roles.size === 0 && message.mentions.channels.size === 0);

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
  execute(message, args) {
    const reason = args[1] || "Kicked by admin";
    const user = message.guild.member(args[0].match(/\d+/)[0]);
    if (user.kickable) {
      user.kick(reason).then((guildMember) => {
        message.channel.send(`**Kicked user \`${guildMember.user.username}\`, reason: \`${reason}\`**`);
      });
    } else {

    }
  }
};