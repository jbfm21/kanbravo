'use strict';
const Enum = require('enumify').Enum;

class CalendarViewMode extends Enum {}

CalendarViewMode.initEnum(['day', 'week', 'month']);

module.exports = CalendarViewMode;
