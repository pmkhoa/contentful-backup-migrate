const contentfulExport = require('contentful-export');

const backupContentfulSpace = async config => {
  try {
    await contentfulExport(config);
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = backupContentfulSpace;
