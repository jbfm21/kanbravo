'use strict';
const Enum = require('enumify').Enum;

class CardStatus extends Enum {}

CardStatus.initEnum(['backlog', 'inboard', 'deleted', 'archived', 'canceled']);

module.exports = CardStatus;
