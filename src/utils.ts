import { Message } from "discord.js";

const ordinal = (n: number) => {
  if (n <= 0) return n.toString();
  const suffixes = ["st", "nd", "rd"];
  const index = n - 1;
  if (index > suffixes.length - 1) return n + "th";
  return n + suffixes[index];
};

interface MentionType {
  type: "user" | "role" | "channel" | "null";
  id: string;
}

const mentionExists = (
  id: string,
  type: "user" | "role" | "channel" | "null",
  message: Message
) => {
  const membersGet = message.guild!.members.cache; // guild must exist as made sure in bot.ts
  const rolesGet = message.guild!.roles.cache; // guild must exist as made sure in bot.ts
  const channelsGet = message.guild!.channels.cache; // guild must exist as made sure in bot.ts
  if (type === "user") return membersGet.get(id) ? true : false;
  else if (type === "role") return rolesGet.get(id) ? true : false;
  else if (type === "channel") return channelsGet.get(id) ? true : false;
  else return false;
};

const getMentionType = (
  mention: string,
  message: Message
): MentionType | null => {
  if (!(mention.startsWith("<") && mention.endsWith(">"))) return null;
  mention = mention.slice(1, -1);

  if (mention.startsWith("@")) {
    mention = mention.slice(1);
    if (mention.startsWith("!") && !mention.startsWith("&")) {
      mention = mention.slice(1);
      return {
        type: mentionExists(mention, "user", message) ? "user" : "null",
        id: mention,
      };
    } else if (mention.startsWith("&")) {
      mention = mention.slice(1);
      return {
        type: mentionExists(mention, "role", message) ? "role" : "null",
        id: mention,
      };
    }
  } else if (mention.startsWith("#")) {
    mention = mention.slice(1);
    return {
      type: mentionExists(mention, "channel", message) ? "channel" : "null",
      id: mention,
    };
  }

  return null;
};

export { ordinal, getMentionType, mentionExists };
