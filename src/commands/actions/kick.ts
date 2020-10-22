import { CommandValidatorOptions } from "./../commandValidator";
import { ICommand } from "./../index";
import CommandValidator from "../commandValidator";
import { getMentionType } from "../../utils";

const kickOptions: CommandValidatorOptions = {
  token: "kick",
  rules: [
    {
      name: "user",
      type: "string",
      required: true,
    },
    {
      name: "reason",
      type: "any",
      multi: true,
    },
  ],
};

const Command: ICommand = {
  validator: new CommandValidator(kickOptions),
  optValidator(args, message) {
    return new Promise((resolve, reject) => {
      const mentions = getMentionType(args[0], message);
      if (!(mentions && mentions.type === "user")) {
        return reject(`You must \`@mention\` a user`);
      }

      const user = message.guild!.member(mentions.id)!;
      if (!user.kickable) {
        return reject(`You cannot kick \`${user.user.username}\``);
      }

      resolve();
    });
  },
  execute(args, message) {
    const user = message.guild!.members.cache.get(
      getMentionType(args[0], message)!.id
    )!;
    const reason =
      args
        .slice(1, args.length)
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
        .join(" ") || "Kicked by admin";
    user.kick(reason).then((guildMember) => {
      message.channel.send(
        `**Kicked user \`${guildMember.user.username}\`, reason: \`${reason}\`**`
      );
    });
  },
};

export default Command;
