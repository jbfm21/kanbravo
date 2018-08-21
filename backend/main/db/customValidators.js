'use strict';
var validators = require('validator');
class CustomValidators
{
    isDateBefore(value, maxDate)
    {
        if (value && !validators.isDate(value.toString())) {return false;}
        if (!value || !maxDate) {return true;}
        return value <= maxDate;
    }

    isDateAfter(value, minDate)
    {
        if (value && !validators.isDate(value.toString())) { return false;}
        if (!value || !minDate) {return true;}
        return minDate <= value;
    }
}

module.exports = new CustomValidators();
