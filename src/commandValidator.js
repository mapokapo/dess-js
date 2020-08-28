// sample input for CommandValidator:
// {
//   token: "command",
//   args: [
//     {
//       name: "first_arg",
//       type: "string",
//       required: true
//     },
//     {
//       name: "second_arg",
//       type: "integer",
//       required: true
//     },
//     {
//       name: "third_arg",
//       type: "float"
//     },
//     {
//       name: "rest",
//       type: "any",
//       multi: true
//     },
//   ]
// }

class CommandValidator {
  constructor({ token, args }) {
    if (typeof token === "string") {
      this.token = token;
    } else {
      throw new TypeError("Argument `token` must be of type `string`");
    }

    if (args) {
      if (!Array.isArray(args)) throw new TypeError("Argument `args` must be an array");
      const argTypes = ["string", "integer", "float", "any"];
      const result = args.every((arg, index) => {
        if (typeof arg === "object" && typeof arg.name === "string" && argTypes.includes(arg.type) && (!arg.required || typeof arg.required === "boolean")) {
          if (arg.multi === true) {
            if (index === args.length - 1) return true;
            return false;
          }
          return true;
        }
        return false;
      });
      if (!result) throw new TypeError(`Argument \`args\` must be an array of objects with the following structure:\n{\n\tname: string,\n\ttype: ${argTypes.map(type => `"${type}"`).join(" | ")},\n\trequired?: boolean,\n\tmulti?: boolean\n}`)
      else this.args = args;
    } else {
      this.args = null;
    }
  }

  ordinal = number => {
    if (number <= 0) return number.toString();
    const suffixes = ["st", "nd", "rd"];
    const index = number - 1;
    if (index > suffixes.length - 1) return number + "th";
    return number + suffixes[index];
  }

  getUserFromMention(mention, message) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
      mention = mention.slice(2, -1);

      if (mention.startsWith('!')) {
        mention = mention.slice(1);
      }

      return message.guild.members.cache.get(mention);
    }
  }

  validate(args, message) {
    return new Promise((resolve, reject) => {
      if (this.args === null || this.args.length === 0) resolve();
      if (args.length < this.args.filter(arg => arg.required === true).length) return reject(`Too few arguments supplied: (\`${args.length || "none"}\`), required: \`${this.args.filter(arg => arg.required === true).map(arg => arg.name).join(", ")}\``);
      if (!this.args[this.args.length - 1].multi && args.length > this.args.length) return reject(`Too many arguments supplied (\`${args.length}\`), valid arguments are: \`${this.args.map(arg => arg.name).join(", ")}\``);

      for (const argIndex in args) {
        let argType = "string";
        if (!isNaN(args[argIndex]) && this.args[argIndex].type !== "any") {
          if (Number.isInteger(parseFloat(args[argIndex]))) {
            argType = "integer";
          } else {
            argType = "integer";
          }
        }

        if (argIndex >= this.args.length) {
          continue;
        }

        if (this.args[argIndex].type !== "any") {
          if (argType !== this.args[argIndex].type) {
            let arg = args[argIndex];
            // Parse mention strings into user-readable form
            if (/^<@!?\d+>$/.test(arg)) {
              const member = this.getUserFromMention(arg, message);
              arg = member.user.tag;
            } else if (/^<#\d+>$/.test(arg)) {
              arg = "#" + message.guild.channels.cache.get(arg.slice(2, arg.length - 1)).name;
            } else if (/^<@&\d+>$/.test(arg)) {
              arg = "@" + message.guild.roles.cache.get(arg.slice(3, arg.length - 1)).name;
            }
            return reject(`The ${this.ordinal(parseInt(argIndex) + 1)} argument (\`${arg}\`) must be of type \`${this.args[argIndex].type}\``);
          }
        }
      }

      resolve();
    });
  }
}

module.exports = {
  CommandValidator
};