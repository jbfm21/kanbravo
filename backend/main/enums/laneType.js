'use strict';
const Enum = require('enumify').Enum;

class LaneType extends Enum {}

LaneType.initEnum(['wait', 'ready', 'inprogress', 'tracking', 'completed']);

module.exports = LaneType;
