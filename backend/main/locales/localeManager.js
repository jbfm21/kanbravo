'use strict;';

var i18n = require('i18n');

i18n.configure({locales: ['pt-br'], directory: __dirname, defaultLocale: 'pt-br', extension: '.json'});
i18n.init();

module.exports = i18n;
