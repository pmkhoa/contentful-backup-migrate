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
      type: 'confirm',
      name: 'skipContent',
      message: 'Skip Content?',
      default: false,
      prefix,
    },
    {
      type: 'confirm',
      name: 'skipRoles',
      message: 'Skip Roles?',
      default: false,
      prefix,
    },
    {
      type: 'confirm',
      name: 'skipWebhooks',
      message: 'Skip Webhooks?',
      default: false,
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
};

module.exports = questions;
