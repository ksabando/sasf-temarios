const path = require('path');

module.exports = function docusaurusAuth(_context, options) {
  return {
    name: 'docusaurus-auth',

    getThemePath() {
      return path.resolve(__dirname, 'theme');
    },

    getClientModules() {
      return [
        path.resolve(__dirname, 'theme/AuthContext'),
        path.resolve(__dirname, '../../src/clientModules/sidebarVisibility'),
      ];
    },

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: `window.__AUTH_PASSWORD_HASH__ = ${JSON.stringify(options.passwordHash)};`,
          },
        ],
      };
    },
  };
};
