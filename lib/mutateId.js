#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');

const run = (market, file) => {
  const data = fs.readJSONSync(file);

  const assets = data.assets.map(asset => asset.sys.id);
  const entries = data.entries.map(entry => entry.sys.id);
  const allIds = [...assets, ...entries];
  const dataJSON = JSON.stringify(data, null, 2);

  const updatedData = allIds.reduce((acc, id) => {
    const regex = new RegExp(id, 'g');
    return acc.replace(regex, `${market}${id}`);
  }, dataJSON);

  const fileNameParts = file.split('/');
  const fileName = fileNameParts.pop();
  const filePath = fileNameParts.join('/');
  const fullFileName = path.resolve(filePath, `${market}-${fileName}`);

  fs.writeFileSync(fullFileName, updatedData, 'utf-8');
  console.info(chalk.green('Done'), `Updated file written at ${fullFileName}`);
};

const init = async () => {
  try {
    program
      .description(
        'CLI tool to mutate the IDs of entries and assets from a Contentful export JSON'
      )
      .option(
        '-p, --prefix <prefix>',
        'Prefix to add to the entry and asset IDs'
      )
      .option('-f, --file <file>', 'Path to the file to mutate');

    program.parse(process.argv);

    const { prefix, file } = program;

    if (!prefix || !file) {
      // eslint-disable-next-line no-throw-literal
      throw 'A prefix and a file are needed to run this script';
    }

    run(prefix, file);
    process.exit(0);
  } catch (err) {
    console.error(chalk.red('Error'), err);
    process.exit(1);
  }
};

init();
