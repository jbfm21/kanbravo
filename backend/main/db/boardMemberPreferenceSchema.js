'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let boardMemberPreferenceSchema = new Schema({
    isToReceiveBoardChangeNotification: {type: Boolean, default: true}
});

module.exports = boardMemberPreferenceSchema;
