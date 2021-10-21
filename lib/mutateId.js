#!/usr/bin/env node
/* eslint-disable prefer-destructuring */

const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');

const run = (market, file) => {
  const data = fs.readJSONSync(file);

  const assets = data.assets.map(asset => asset.sys.id);
  const entries = data.entries.map(entry => entry.sys.id);
  const allIds = [...assets, ...entries];
  const locales = [];

  // Check for main locale
  data.locales.forEach((locale, idx) => {
    if (locale.default) {
      locales.push({ old: locale.code, new: 'en-US' });
      data.locales[idx].code = 'en-US';
      data.locales[idx].fallbackCode = null;
      data.locales[idx].name = 'Main locale';
    }
  });

  // Check for secondary locale
  data.locales.forEach((locale, idx) => {
    if (!locale.default) {
      locales.push({ old: locale.code, new: 'en-GB' });
      data.locales[idx].code = 'en-GB';
      data.locales[idx].fallbackCode = 'en-US';
      data.locales[idx].name = 'Secondary locale';
    }
  });

  const dataJSON = JSON.stringify(data, null, 2);

  const updatedData = allIds.reduce((acc, id) => {
    const regex = new RegExp(`"${id}"`, 'g');
    return acc.replace(regex, `"${market}-${id}"`);
  }, dataJSON);

  const localeFixedData = locales.reduce((acc, locale) => {
    const regex = new RegExp(`"${locale.old}"`, 'g');
    return acc.replace(regex, `"${locale.new}"`);
  }, updatedData);

  const fileNameParts = file.split('/');
  const fileName = fileNameParts.pop();
  const filePath = fileNameParts.join('/');
  const fullFileName = path.resolve(filePath, `${market}-${fileName}`);

  fs.writeFileSync(fullFileName, localeFixedData, 'utf-8');
  console.info(
    '\n',
    chalk.blue('info'),
    `Prefixed file written at ${fullFileName}`
  );
};

module.exports = run;
