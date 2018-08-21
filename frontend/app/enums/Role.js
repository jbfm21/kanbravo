'use strict';
const Enum = require('enumify').Enum;

class Role extends Enum
{

}

Role.initEnum(['member', 'watcher']);

module.exports = Role;
