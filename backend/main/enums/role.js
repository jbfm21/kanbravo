'use strict';
const Enum = require('enumify').Enum;

class Roles extends Enum
{

}

Roles.initEnum(['member', 'watcher']);

module.exports = Roles;
