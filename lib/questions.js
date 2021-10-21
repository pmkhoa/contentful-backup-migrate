const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

const prefix = chalk.green('>');

const questions = {
  start: [
    {
      type: 'confirm',
      name: 'newBackup',
      message: `Create a new backup?`,
      default: true,
      prefix,
    },
  ],
  backup: [
    {
      type: 'input',
      name: 'spaceId',
      message: 'Contentful spaceId?',
      validate: input => {
        if (!input.length) {
          return 'A Space ID is required';
        }
        return true;
      },
      prefix,
    },
    {
      type: 'input',
      name: 'managementToken',
      message: 'Contentful Management Token?',
      validate: input => {
        if (!input.length) {
          return 'A Management Token is required';
        }
        return true;
      },
      prefix,
    },
    {
      type: 'input',
      name: 'environmentId',
      message: 'Environment to backup?',
      default: 'master',
      prefix,
    },
    {
      type: 'input',
      name: 'entryPrefix',
      message:
        'Prefix for entry and asset iIDs? (generates extra file. Leave empty if not needed)',
      default: '',
      prefix,
    },
    {
      type: 'confirm',
      name: 'skipContent',
      message: 'Skip Content?',
      default: true,
      prefix,
    },
    {
      type: 'confirm',
      name: 'skipRoles',
      message: 'Skip Roles?',
      default: true,
      prefix,
    },
    {
      type: 'confirm',
      name: 'skipWebhooks',
      message: 'Skip Webhooks?',
      default: true,
      prefix,
    },
    {
      type: 'confirm',
      name: 'allConfirmed',
      message: answers => {
        return `Is this configuration correct?\n${chalk.reset.cyan(
          JSON.stringify(answers, null, '  ')
        )}\n`;
      },
      default: true,
      prefix,
    },
  ],
  noBackup: [
    {
      type: 'input',
      name: 'backupFile',
      message: 'Backup file location:',
      validate: input => {
        const filePath = path.resolve(input);
        if (!fs.pathExistsSync(filePath)) {
          return `The file at ${filePath} doest not exist. Please provide a valid backup file`;
        }
        return true;
      },
      prefix,
    },
  ],
  migrate: [
    {
      type: 'confirm',
      name: 'import',
      message: 'Re-import backup to a new Contentful Space?',
      default: true,
      prefix,
    },
  ],
  migrateConfig: [
    {
      type: 'input',
      name: 'spaceId',
      message: 'Contentful spaceId?',
      validate: input => {
        if (!input.length) {
          return 'A Space ID is required';
        }
        return true;
      },
      prefix,
    },
    {
      type: 'input',
      name: 'managementToken',
      message: 'Contentful Management Token?',
      validate: input => {
        if (!input.length) {
          return 'A Management Token is required';
        }
        return true;
      },
      prefix,
    },
    {
      type: 'input',
      name: 'environmentId',
      message: 'Environment to migrate to?',
      default: 'master',
      prefix,
    },
    {
      type: 'confirm',
      name: 'contentModelOnly',
      message: 'Import content model only?',
      default: true,
      prefix,
    },
    {
      type: 'confirm',
      name: 'skipContentModel',
      message: 'Skip Content model?',
      default: true,
      prefix,
      when: answers => {
        return !answers.contentModelOnly;
      },
    },
    {
      type: 'confirm',
      name: 'skipLocales',
      message: 'Skip Locales?',
      default: true,
      prefix,
    },
    {
      type: 'confirm',
      name: 'skipContentPublishing',
      message: 'Skip Content publishing?',
      default: true,
      prefix,
    },
    {
      type: 'confirm',
      name: 'allConfirmed',
      message: answers => {
        return `Is this configuration correct?\n${chalk.reset.cyan(
          JSON.stringify(answers, null, '  ')
        )}\n`;
      },
      default: true,
      prefix,
    },
  ],
};

module.exports = questions;
