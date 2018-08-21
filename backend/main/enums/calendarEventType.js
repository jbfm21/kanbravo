'use strict';
const Enum = require('enumify').Enum;

class CalendarEventType extends Enum {}

CalendarEventType.initEnum(['startPlanningDate', 'endPlanningDate', 'startExecutionDate', 'endExecutionDate', 'reminder', 'timesheet']);

module.exports = CalendarEventType;
