import { Message } from "discord.js";
import { ordinal, getMentionType } from "../utils";
// sample input for CommandValidator:
// {
//   token: "command",
//   rules: [
//     {
//       name: "first_arg",
//       type: "string",
//       required: true
//     },
//     {
//       name: "second_arg",
//       type: "number",
//       required: true
//     },
//     {
//       name: "third_arg",
//       type: "number"
//     },
//     {
//       name: "rest",
//       type: "any",
//       multi: true
//     },
//   ]
// }

interface _CommandValidatorOptionRule1 {
  name: string;
  type: "string" | "number" | "any";
  required?: boolean;
  multi?: false | undefined;
}

interface _CommandValidatorOptionRule2 {
  name: string;
  type: "string" | "number" | "any";
  required?: false | undefined;
  multi?: boolean;
}

type CommandValidatorOptionRule =
  | _CommandValidatorOptionRule1
  | _CommandValidatorOptionRule2;

export interface CommandValidatorOptions {
  token: string;
  rules?: CommandValidatorOptionRule[];
}

class CommandValidator {
  token: string;
  rules: CommandValidatorOptionRule[] | null;

  constructor({ token, rules }: CommandValidatorOptions) {
    this.token = token;
    this.rules = rules || null;
  }

  validate(args: string[], message: Message) {
    return new Promise((resolve, reject) => {
      // No argument rules supplied = no need to validate arguments
      if (this.rules === null || this.rules.length === 0) return resolve();

      // this.args = argument validation rules, args = arguments to be validated
      if (
        args.length < this.rules.filter((rule) => rule.required === true).length
      )
        return reject(
          `Too few arguments supplied: (\`${
            args.length || "none"
          }\`), required: \`${this.rules
            .filter((rule) => rule.required === true)
            .map((rule) => rule.name)
            .join(", ")}\``
        );

      // If the last arugment rule is not "multi" type, yet the amount of arguments is more than required, reject
      if (
        !this.rules[this.rules.length - 1].multi &&
        args.length > this.rules.length
      )
        return reject(
          `Too many arguments supplied (\`${
            args.length
          }\`), valid arguments are: \`${this.rules
            .map((rule) => rule.name)
            .join(", ")}\``
        );

      // Validate argument types
      for (const _argIndex in args) {
        // Typescript complains if we don't do this
        const argIndex = parseInt(_argIndex);

        // First, determine what type of argument we're dealing with

        // Possible types of the argument, assumed to be "string" by default
        let argType: "string" | "number" = "string";

        // If the argument is numeric then it is of type "number"
        if (!isNaN(parseFloat(args[argIndex]))) {
          argType = "number";
        }

        // If the argument wasn't a number (and thus a string), then we need to check for mentions, and if there are any, make sure they are valid
        if (argType === "string") {
          const mentionType = getMentionType(args[argIndex], message);
          // Only check mention validity if it is indeed a mention
          if (mentionType) {
            // If the mention points to something that doesn't exist
            if (mentionType.type === "null") {
              return reject(
                `The ${ordinal(argIndex + 1)} argument mentions id (\`${
                  mentionType.id
                }\`) which does not exist`
              );
            }
          }
        }

        // If there are more arguments than argument rules, then skip them
        // The "multi" property check above has already made sure that it actually exists and the amount of arguments is bigger than the amount of argument ruels
        // Since the point of the "multi" property is to have multiple overflow arguments, they cannot be checked using this generic command validator
        // if the argument types must be checked, either define them in the argument rules or check the types at runtime
        if (argIndex >= this.rules.length) {
          continue;
        }

        // If the type rule isn't "any", but the gathered argType doesn't match it's rule, then the supplied argument is invalid
        if (this.rules[argIndex].type !== "any") {
          if (argType !== this.rules[argIndex].type) {
            let arg = args[argIndex];
            // If it's a mention, parse it correctly for the error message
            const mentionType = getMentionType(arg, message);
            if (mentionType) {
              if (mentionType.type === "user") {
                const member = message.guild!.members.cache.get(
                  mentionType.id
                )!;
                arg = member.user.tag;
              } else if (mentionType.type === "channel") {
                const channel = message.guild!.channels.cache.get(
                  mentionType.id
                )!;
                arg = "#" + channel.name;
              } else if (mentionType.type === "role") {
                const role = message.guild!.roles.cache.get(mentionType.id)!;
                arg = "@" + role.name;
              }
            }
            return reject(
              `The ${ordinal(
                argIndex + 1
              )} argument (\`${arg}\`) must be of type \`${
                this.rules[argIndex].type
              }\``
            );
          }
        } // The argument rule is "any" and thus doesn't need to be checked, so we can continue
      } // All rules passed successfully according to the argument rules, proceed to resolve

      resolve();
    });
  }
}

export default CommandValidator;
