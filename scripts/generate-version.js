// This script generates src/version.js with version and build time info from package.json
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const versionParts = pkg.version.split('.');
const major = versionParts[0] || '0';
const minor = versionParts[1] || '0';

const buildNumberFile = path.join(__dirname, '../.build_number');
let build = 0;
if (fs.existsSync(buildNumberFile)) {
  build = parseInt(fs.readFileSync(buildNumberFile, 'utf8'), 10) || 0;
}
build += 1;
fs.writeFileSync(buildNumberFile, build.toString());

const version = `${major}.${minor}.${build}`;
const buildTime = new Date().toISOString();

const content = `// This file is auto-generated during build. Do not edit manually.
module.exports = {
  version: "${version}",
  buildTime: "${buildTime}"
};
`;

fs.writeFileSync(path.join(__dirname, '../src/version.js'), content);
console.log('Generated src/version.js with version', version, 'and build time', buildTime); 