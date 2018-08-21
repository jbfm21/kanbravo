'use strict';
const Enum = require('enumify').Enum;

class Roles extends Enum
{

}

Roles.initEnum(['generic', 'clearquest']);

module.exports = Roles;
