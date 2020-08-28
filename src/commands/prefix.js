const { CommandValidator } = require("../commandValidator");

const banOptions = {
  token: "prefix",
  args: [
    {
      name: "prefix",
      type: "string",
      required: true
    }
  ]
}

module.exports = {
  validator: new CommandValidator(banOptions),
  execute(args, message, _setPrefix) {
    _setPrefix(args[0]);
    message.channel.send(`**Changed prefix to: \`${args[0]}\`**`);
  }
};