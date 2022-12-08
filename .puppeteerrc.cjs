const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join('var', 'lib', 'jenkins', '.cache', 'puppeteer'), // Avoid "Error: Could not find Chromium (rev. 1056772)."
};