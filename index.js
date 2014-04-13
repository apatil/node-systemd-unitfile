var fs = require("fs");
var path = require("path");
var decode = require("./decode");

exports.dumpsFile = dumpsFile = function dumpsFile(fileObjRep) {
  var sectionContents = [];
  var sections = Object.getOwnPropertyNames(fileObjRep);
  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];
    var sectionRep = fileObjRep[section];
    var lines = ["[" + section + "]"];
    var entries = Object.getOwnPropertyNames(sectionRep);
    
    for (var j = 0; j < entries.length; j++) {
      var entry = entries[j];
      var entryRep = sectionRep[entry];
      if (typeof(entryRep) === "object") {
        for (var k = 0; k < entryRep.length; k++) {
          lines.push(entry + "=" + entryRep[k]);
        }
      } else {
        lines.push(entry + "=" + entryRep);
      }
    }
    sectionContents.push(lines.join("\n"));
  }
  return sectionContents.join("\n\n") + "\n";
};

exports.dumps = function dumps(objRep) {
  var iniRep = {};
  var fnames = Object.getOwnPropertyNames(objRep);
  for (var i = 0; i < fnames.length; i++) {
    var fname = fnames[i];
    iniRep[fname] = dumpsFile(objRep[fname]);
  }
  return iniRep;
};

var parseObj = function parseObj(iniRep) {
  var objRep = {};
  var fnames = Object.getOwnPropertyNames(iniRep);
  for (var i = 0; i < fnames.length; i++) {
    objRep[fnames[i]] = decode(iniRep[fnames[i]]);
  }
  return objRep;
}

var parseDir = function parseDir(dirpath) {
  var iniRep = {};
  var fnames = fs.readdirSync(dirpath);
  for (var i = 0; i < fnames.length; i++) {
    var fname = fnames[i];
    iniRep[fname] = fs.readFileSync(path.join(dirpath, fname)).toString();
  }
  return parseObj(iniRep);
};

exports.parse = function parse(dirpathOrIniRep) {
  if (typeof(dirpathOrIniRep) === "string") {
    return parseDir(dirpathOrIniRep);
  } else {
    return parseObj(dirpathOrIniRep)
  }
};

exports.write = function write(dirpath, objRepOrIniRep) {
  if (!fs.existsSync(dirpath)) {
    throw new Error("Directory " + dirpath + " does not exist.")
  }
  var fnames = Object.getOwnPropertyNames(objRepOrIniRep);
  for (var i = 0; i < fnames.length; i++) {
    var fname = fnames[i];
    var outPath = path.join(dirpath, fname);
    var fileRep = objRepOrIniRep[fname];
    if (typeof(fileRep) === "string") {
      fs.writeFileSync(outPath, fileRep);
    } else {
      fs.writeFileSync(outPath, dumpsFile(fileRep));
    }
  }
};