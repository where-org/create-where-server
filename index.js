#!/usr/bin/env node

import path from 'node:path';
import url from 'node:url';

import { parseArgs } from 'node:util';

import fs from 'fs-extra';
import prompts from 'prompts';

const main = async () => {

  // package
  const serverPackage = { name: '@where-org/where-server', version: '^2.0.0', };

  const socketPackage = { name: '@where-org/where-socket', version: '^2.0.0', },
        socketAppGeneralPackage = { name: '@where-org/where-socket-app-general', version: '^2.0.0', };

  // config
  const socketConfig = ['config/socket.yaml', 'config/socket-app.yaml'];

  // args
  const { values, positionals } = parseArgs({

    options: {
      socket: { short: 's', type: 'boolean' },
    },

    allowNegative: true,
    allowPositionals: true,

  });

  const { socket } = values,
        [name] = positionals;

  // prompt
  const result = await prompts([{
    // name
    type   : name ? null : 'text',
    name   : 'name',
    message: ':Please enter the where-server name:',
    initial: 'where-server'
  }, {
    //socket
    type   : socket !== undefined ? null : 'confirm',
    name   : 'socket',
    message: 'Would you like to add where-socket and where-socket-app-general?:'
  }]);

  const packageName = name ?? result.name;

  const srcDir = path.resolve(import.meta.dirname, 'templates'),
        destDir = path.resolve(process.cwd(), packageName);

  fs.copySync(srcDir, destDir, {
    filter: (v1) => !socketConfig.some((v2) => v1.includes(v2)),
  });

  // package.json
  const packageJsonPath = path.resolve(destDir, 'package.json'),
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath));

  packageJson.dependencies[serverPackage.name] = serverPackage.version;

  if (socket || result.socket) {
    packageJson.dependencies[socketPackage.name] = socketPackage.version;
    packageJson.dependencies[socketAppGeneralPackage.name] = socketAppGeneralPackage.version;

    socketConfig.forEach(v => (
      fs.copySync(path.resolve(srcDir, v), path.resolve(destDir, v))
    ));
  }

  fs.writeFileSync(
    packageJsonPath, JSON.stringify({ ...packageJson, name: packageName }, null, 2)
  );

  console.log(`
  cd ${packageName}
  npm install
  # Before starting, install the required where-servet-app modules and edit config/server-app.yaml.
  npm start`);

};

main();
