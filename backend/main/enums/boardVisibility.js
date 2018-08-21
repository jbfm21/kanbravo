'use strict';
const Enum = require('enumify').Enum;

class Visibility extends Enum {}

Visibility.initEnum(['internal', 'public', 'publicWrite']);

module.exports = Visibility;
