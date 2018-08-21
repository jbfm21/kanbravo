'use strict';
const Enum = require('enumify').Enum;

class ShowInCard extends Enum {}

ShowInCard.initEnum(['', 'avatar', 'value']);

module.exports = ShowInCard;
