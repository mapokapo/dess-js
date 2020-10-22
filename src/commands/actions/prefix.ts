import { ICommand } from "./../index";
import { CommandValidatorOptions } from "./../commandValidator";
import CommandValidator from "../commandValidator";

const banOptions: CommandValidatorOptions = {
  token: "prefix",
  rules: [
    {
      name: "prefix",
      type: "string",
      required: true,
    },
  ],
};

const Command: ICommand = {
  validator: new CommandValidator(banOptions),
  optValidator() {
    return new Promise((resolve) => resolve());
  },
  execute(args, message, _setPrefix: (prefix: string) => void) {
    _setPrefix(args[0]);
    message.channel.send(`**Changed prefix to: \`${args[0]}\`**`);
  },
};

export default Command;
