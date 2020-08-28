const fs = require("fs");

const exportsArray = [];

const files = fs.readdirSync(__dirname)
const jsFiles = files.filter(fileName => /^(?!.*\.test\.js$).*\.js$/gm.test(fileName) && fileName !== "index.js" && fileName !== "commandInfo.js");
jsFiles.forEach(file => {
  exportsArray.push(require("./" + file));
});

module.exports = exportsArray;