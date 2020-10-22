import { ICommand } from "./../index";
import { CommandValidatorOptions } from "./../commandValidator";
import { getMentionType } from "../../utils";
import CommandValidator from "../commandValidator";

const banOptions: CommandValidatorOptions = {
  token: "ban",
  rules: [
    {
      name: "user",
      type: "string",
      required: true,
    },
    {
      name: "duration",
      type: "number",
    },
    {
      name: "reason",
      type: "any",
      multi: true,
    },
  ],
};

const Command: ICommand = {
  validator: new CommandValidator(banOptions),
  optValidator: (args, message) => {
    return new Promise((resolve, reject) => {
      const mentions = getMentionType(args[0], message);
      if (!(mentions && mentions.type === "user")) {
        return reject(`You must \`@mention\` a user`);
      }

      const user = message.guild!.members.cache.get(mentions.id)!;
      if (!user.bannable) {
        return reject(`You cannot ban \`${user.user.username}\``);
      }

      resolve();
    });
  },
  execute(args, message) {
    const user = message.guild!.members.cache.get(
      getMentionType(args[0], message)!.id
    )!;
    const duration = parseInt(args[1]) || 0;
    const reason =
      args
        .slice(2, args.length)
        .map((str) => {
          const mentionType = getMentionType(str, message);
          if (mentionType) {
            if (mentionType.type === "user") {
              const member = message.guild!.members.cache.get(mentionType.id)!;
              return member.user.tag;
            } else if (mentionType.type === "channel") {
              return "#" + message.guild!.channels.cache.get(mentionType.id)!;
            } else if (mentionType.type === "role") {
              return "@&" + message.guild!.roles.cache.get(mentionType.id)!;
            }
          } else {
            return str;
          }
        })
        .join(" ") || "Banned by admin";
    user.ban({ days: duration, reason }).then((guildMember) => {
      message.channel.send(
        `**Banned user \`${guildMember.user.username}\` for ${duration} days, reason: \`${reason}\`**`
      );
    });
  },
};

export default Command;
