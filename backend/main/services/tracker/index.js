'use strict';

const clearQuest = require('./clearquest-service');
const generic = require('./generic-service');

const services = {
    clearQuest: clearQuest,
    generic: generic
};

module.exports = services  //eslint-disable-line


