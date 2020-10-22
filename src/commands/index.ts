import banCommand from "./commands/ban";
import kickCommand from "./commands/kick";
import infoCommand from "./commands/info";
import prefixCommand from "./commands/prefix";
import CommandValidator from "./commandValidator";
import { Message } from "discord.js";

export default [banCommand, kickCommand, infoCommand, prefixCommand];

export interface ICommand {
  validator: CommandValidator;
  optValidator: (args: string[], message: Message) => Promise<unknown>;
  execute: (args: string[], message: Message, ...rest: any[]) => void;
}
