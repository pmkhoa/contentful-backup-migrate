#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const chalk = require('chalk');
const program = require('commander');
const questions = require('../lib/questions');
const backupContentfulSpace = require('../lib/backup.js');
const migrateContentfulSpace = require('../lib/migrate.js');
const buildPrefixedFile = require('../lib/mutateId');

const attemptBackupSpace = async (input, contentType) => {
  try {
    const d = new Date();
    const now = d.toISOString();

    const config = {
      spaceId: input.spaceId,
      managementToken: input.managementToken,
      environmentId: input.environmentId,
      exportDir: path.resolve('./contentful-backups'),
      contentFile: `${input.spaceId}-${input.environmentId}-${now}.json`,
      skipContent: input.skipContent,
      skipRoles: input.skipRoles,
      skipWebhooks: input.skipWebhooks,
      includeDrafts: true,
    };

    if (contentType) {
      config.queryEntries = [`content_type=${contentType}`];
    }

    fs.ensureDirSync(config.exportDir);
    await backupContentfulSpace(config);
    const backupLocation = path.resolve(config.exportDir, config.contentFile);
    console.info(
      '\n',
      chalk.blue('info'),
      `Backup created at ${backupLocation}`
    );

    if (input.entryPrefix) {
      console.info(
        '\n',
        chalk.blue('info'),
        `Creating file with entry prefixes`
      );
      await buildPrefixedFile(input.entryPrefix, backupLocation);
    }
    return backupLocation;
  } catch (err) {
    throw new Error(err);
  }
};

const getBackupFile = async (newBackpFile, contentType) => {
  try {
    if (newBackpFile) {
      let input = await inquirer.prompt(questions.backup);
      while (!input.allConfirmed) {
        input = await inquirer.prompt(questions.backup);
      }
      return attemptBackupSpace(input, contentType);
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

      console.info(chalk.blue('info'), `Migrating from ${backupFile}`);

      await migrateContentfulSpace(config);
    }
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

const init = async () => {
  try {
    program
      .option(
        '-t, --token <token>',
        'The Contentful Management Token. Will be pre-filled for both backup and migrate steps'
      )
      .option(
        '-o, --origin-spaceid <id>',
        'SpaceID for the origin environment to backup'
      )
      .option(
        '-d, --dest-spaceid <id>',
        'SpaceID for the destination environment to migrate to'
      )
      .option(
        '-p, --prefix-id <id>',
        'Creates a second export file with updated IDs for entries and assets using the value passed as the prefix'
      )
      .option(
        '-c, --content-type <id>',
        'Content type to backup. If ignored, all will be backed up'
      )
      .option('-f --file <file>', 'Existing backup to use for a new import');

    program.parse(process.argv);

    if (program.token) {
      questions.backup[1].default = program.token;
      questions.migrateConfig[1].default = program.token;
    }

    if (program.originSpaceid) {
      questions.backup[0].default = program.originSpaceid;
    }

    if (program.prefixId) {
      questions.backup[3].default = program.prefixId;
    }

    if (program.destSpaceid) {
      questions.migrateConfig[0].default = program.destSpaceid;
    }

    if (!program.file) {
      console.info('\n', chalk.blue('info'), 'Backup configuration', '\n');
    }

    const backup = program.file
      ? false
      : await inquirer.prompt(questions.start);
    const backupFile = program.file
      ? program.file
      : await getBackupFile(backup.newBackup, program.contentType);

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
