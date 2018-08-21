'use strict';
const Enum = require('enumify').Enum;

class FieldType extends Enum {}

FieldType.initEnum(['numeric', 'short_string', 'text', 'date', 'datetime', 'dropdown']);

module.exports = FieldType;
