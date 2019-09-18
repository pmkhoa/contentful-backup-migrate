#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const chalk = require('chalk');
const questions = require('../lib/questions');
const backupContentfulSpace = require('../lib/backup.js');
const migrateContentfulSpace = require('../lib/backup.js');

const attemptBackupSpace = async input => {
  try {
    const d = new Date();
    const now = d.toISOString();

    const config = {
      spaceId: input.spaceId,
      managementToken: input.managementToken,
      environmentId: input.environmentId,
      exportDir: path.resolve('./contentful-backups'),
      contentFile: `${input.spaceId}-${input.environmentId}-${now}.json`,
      skipContent: true,
      skipRoles: true,
      skipWebhooks: true,
    };
    fs.ensureDirSync(config.exportDir);
    await backupContentfulSpace(config);
    const backupLocation = path.resolve(config.exportDir, config.contentFile);
    console.info(
      '\n',
      chalk.blue('info'),
      `Backup created at ${backupLocation}`
    );
    return backupLocation;
  } catch (err) {
    throw new Error(err);
  }
};

const getBackupFile = async newBackpFile => {
  try {
    if (newBackpFile) {
      let input = await inquirer.prompt(questions.backup);
      while (!input.allConfirmed) {
        input = await inquirer.prompt(questions.backup);
      }
      return attemptBackupSpace(input);
    }

    const input = await inquirer.prompt(questions.noBackup);
    return input.backupFile;
  } catch (err) {
    throw new Error(err);
  }
};

const attemptMigrateSpaces = async (shouldMigrate, backupFile) => {
  try {
    if (shouldMigrate) {
      let input = await inquirer.prompt(questions.migrateConfig);
      while (!input.allConfirmed) {
        input = await inquirer.prompt(questions.migrateConfig);
      }
      const config = {
        spaceId: input.spaceId,
        managementToken: input.managementToken,
        environmentId: input.environmentId,
        contentFile: backupFile,
        contentModelOnly: input.contentModelOnly,
        skipContentModel: input.skipContentModel || false,
        skipLocales: input.skipLocales,
        skipContentPublishing: input.skipContentPublishing,
      };

      await migrateContentfulSpace(config);
    }
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

const init = async () => {
  try {
    console.info('\n', chalk.blue('info'), 'Backup configuration', '\n');
    const backup = await inquirer.prompt(questions.start);
    const backupFile = await getBackupFile(backup.newBackup);
    console.info('\n', chalk.blue('info'), 'Migrations configuration', '\n');
    const migrate = await inquirer.prompt(questions.migrate);
    await attemptMigrateSpaces(migrate.import, backupFile);
    console.info('\n', chalk.green.bold('success'), 'Process complete!', '\n');
    process.exit(0);
  } catch (err) {
    console.error(chalk.red('error'), err);
    process.exit(1);
  }
};

init();
