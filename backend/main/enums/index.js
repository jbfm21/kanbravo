'use strict';

const boardVisibility = require('./boardVisibility');
const calendarEventType = require('./calendarEventType');
const calendarViewMode = require('./calendarViewMode');
const cardStatus = require('./cardStatus');
const role = require('./role');
const laneType = require('./laneType');
const fieldType = require('./fieldType');
const showInCard = require('./showInCard');
const trackerIntegrationType = require('./trackerIntegrationType');

const enums = {
    boardVisibility: boardVisibility,
    calendarEventType: calendarEventType,
    calendarViewMode: calendarViewMode,
    cardStatus: cardStatus,
    role: role,
    laneType: laneType,
    fieldType: fieldType,
    showInCard: showInCard,
    trackerIntegrationType: trackerIntegrationType
};

module.exports = enums  //eslint-disable-line
