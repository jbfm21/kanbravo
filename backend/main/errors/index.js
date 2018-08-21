'use strict';

const appError = require('./app-error');
const concurrencyError = require('./concurrency-error');
const formError = require('./form-error');

const errors = {
    appError: appError,
    concurrencyError: concurrencyError,
    formError: formError
};

module.exports = errors  //eslint-disable-line
