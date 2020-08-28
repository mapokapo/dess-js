const package = require("./package.json");

module.exports = {
  prefix: "!",
  version: package.version,
  description: package.description,
  author: package.author
}