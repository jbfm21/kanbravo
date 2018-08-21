'use strict';

import _ from 'lodash';
import moment from 'moment';
import momentLocale from './moment-pt-br'; //eslint-disable-line
let localeFormat = 'pt-br';
moment.locale(localeFormat);

//TODO: veriificar em todos os lugares que tem moment(xpto) se não é para usar a funcao getMomentDate, por conta de datas que terminam com 00.00.00.00

var th = ['', 'thousand', 'million', 'billion', 'trillion'];
var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export default class FunctionHelper
{
    static isCntrlEnterKeyPressed(e)
    {
        return (e.ctrlKey && ((e.keyCode || e.which) === 13 || (e.keyCode || e.which) === 10));
    }

    static mergeIfMatch(entities, entityToMatch, propertyToFind)
    {
        let match = _.find(entities, {[propertyToFind]: entityToMatch[propertyToFind]});
        if (match)
        {
            _.merge(match, entityToMatch);
        }
    }

    /*Convert textlist to JSON DropDown label/value format
    * Text List Example 1
    * 1=high
    * 2=medium
    * 3=low
    *
    * Return
    * [{label: high, value: 1}, {label: medium, value: 2}, {label: low, value: 3}]
    *
    * Text List Example 2
    * high
    * medium
    * low
    *
    * Return
    * [{label: high, value: high}, {label: medium, value: medium}, {label: low, value: low}]

    */

    static getDomainPath()
    {
        return `http://${window.location.hostname}:3000`; //eslint-disable-line
    }

    static convertTextListToDropDownList(textList)
    {
        var pairs = textList.split('\n');
        var result = [];
        pairs.forEach(function(pair)
        {
            if (pair.indexOf('=') !== -1)
            {
                pair = pair.split('=');
                result.push({label: pair[1] || '', value: pair[0] || ''});
            }
            else
            {
                result.push({label: pair || '', value: pair || ''});
            }
        });
        return result;
    }

    static clone(obj)
    {
        return JSON.parse(JSON.stringify(obj));
    }
    static cloneAndAssign(item, values)
    {
        let itemCloned = FunctionHelper.clone(item);
       _.assign(itemCloned, values);
       return itemCloned;
    }

    static assign(item, values)
    {
       _.assign(item, values);
       return item;
    }


    static isUndefined(obj)
    {
        return obj === null || typeof obj === 'undefined' || obj === 'undefined';
    }

    static convertRgbaToString(rgba)
    {
        if (FunctionHelper.isUndefined(rgba))
        {
            return null;
        }
        return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
    }


    static isDefined(obj)
    {
        return !FunctionHelper.isUndefined(obj);
    }

    static isString(value)
    {
        return (typeof value === 'string' || value instanceof String);
    }

    static isNotNullOrEmpty(obj)
    {
        if (FunctionHelper.isUndefined(obj))
        {
            return false;
        }
        if (FunctionHelper.isString(obj))
        {
            return obj.trim() !== '';
        }
        return true;
    }

    static isNullOrEmpty(obj)
    {
        return !FunctionHelper.isNotNullOrEmpty(obj);
    }

    static getId(obj)
    {
        //Retorna o ID da propriedade no caso em que o item está populado ou não
        return FunctionHelper.isDefined(obj) && FunctionHelper.isDefined(obj._id) ? obj._id : obj;
    }

    static isArrayNullOrEmpty(arr)
    {
        if (FunctionHelper.isUndefined(arr))
        {
            return true;
        }
        return !arr.length || arr.length === 0;
    }

    static isArrayNotEmpty(arr)
    {
        if (FunctionHelper.isUndefined(arr))
        {
            return false;
        }
        return arr.length && arr.length > 0;
    }

    static uuid()
    {
        var i, random;
        var uuid = '';
        for (i = 0; i < 32; i++)
        {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20)
            {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16); //eslint-disable-line no-nested-ternary
        }
        return uuid;
    }

    static getCurrentLocale()
    {
        let locale = navigator.language.split('-');  //eslint-disable-line no-undef
        return locale[1] ? `${locale[0]}-${locale[1].toUpperCase()}` : navigator.language; //eslint-disable-line no-undef
    }

    static formatServerErrorMessage(response)
    {
        if (response.status === 403)
        {
            return response.body.message;
        }
        if (response.status === 418 && response.body.code === 'FormError')
        {
            let messages = response.body.message;
            return _(messages).uniqBy('msg').map(message => message.msg).join(',');
        }
        if (response.status === 409 && response.body.code === 'ConcurrencyError')
        {
            return response.body.message.text;
        }
        if (response.body && response.body.message)
        {
            return response.body.message;
        }
        return 'Ops, desculpa, mas não foi possível processar sua requisição. Realize um refresh no browser, e tente novamente. Grandes chances de ter sido disponibilizada uma nova versão...';
    }

    static nullIfEmpty(obj)
    {
        return (FunctionHelper.isDefined(obj) && obj.length > 0) ? obj : null;
    }

    static hash(str)
    {
      return str.split('').reduce((prevHash, currVal) => ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);
    }

    static toWords(s)
    {
        s = s.toString(); s = s.replace(/[\, ]/g, '');
        if (s !== parseFloat(s).toString())
        {
            return 'not a number';
        }
        var x = s.indexOf('.');
        if (x === -1)
        {
            x = s.length;
        }
        if (x > 15)
        {
            return 'too big';
        }
        var n = s.split('');
        var str = '';
        var sk = 0;
        for (let i = 0; i < x; i++)
        {
            if ((x - i) % 3 === 2)
            {
                if (n[i] === '1')
                {
                    str += tn[Number(n[i + 1])] + ' ';
                    i++; sk = 1;
                }
                else if (n[i] !== 0)
                {
                    str += tw[n[i] - 2] + ' ';
                    sk = 1;
                }
            }
            else if (n[i] !== 0)
            {
                str += dg[n[i]] + ' ';
                if ((x - i) % 3 === 0)
                {
                    str += 'hundred ';
                }
                sk = 1;
            }
            if ((x - i) % 3 === 1)
            {
                if (sk)
                {
                    str += th[(x - i - 1) / 3] + ' ';
                }
                sk = 0;
            }
        }
        if (x !== s.length)
        {
            var y = s.length; str += 'point ';
            for (var i = x + 1; i < y; i++)
            {
                str += dg[n[i]] + ' ';
            }
        }
        return str.replace(/\s+/g, ' ');
    }

    static pad(value, width, char)
    {
        if (FunctionHelper.isUndefined(value) || FunctionHelper.isUndefined(width) || FunctionHelper.isUndefined(char))
        {
            return value;
        }

        char = char || '0';
        value += '';
        let totalArrayChars = width - value.length + 1;
        if (totalArrayChars < 1)
        {
            return value;
        }
        return value.length >= width ? value : new Array(width - value.length + 1).join(char) + value;
    }

    static extend()
    {
        var newObj = {};
        for (var i = 0; i < arguments.length; i++)
        {
            var obj = arguments[i];
            for (var key in obj) //eslint-disable-line
            {
                newObj[key] = obj[key];
            }
        }
        return newObj;
	}

    static dateOrNow = (date) =>
    {
        return (date) ? FunctionHelper.dateOrNull(date) : moment().toDate();
    }

    static isValidDate(date)
    {
        return FunctionHelper.dateOrNull(date) !== null;
    }

    static dateOrNull(date)
    {
        let momentDate = this.getMomentDate(date);
        return (momentDate !== null) ? momentDate.toDate() : null;
    }

    static dateOrNullAndAddHours(date, hoursToAdd)
    {
        let momentDate = this.getMomentDate(date);
        return (momentDate !== null) ? momentDate.add(hoursToAdd, 'hours').toDate() : null;
    }


    static utcDateOrNull = (date) =>
    {
        return (date) ? moment(date).utc().toDate() : null;
    }

    static fromNow = (startDate) =>
    {
        return moment(startDate).fromNow();
    }

    static fromDateOrNow = (startDate, endDate) =>
    {
        if (endDate)
        {
            return moment(startDate).from(endDate, true);
        }
        return moment(startDate).fromNow();
    }

    static formatDate(date, format, placeHolder)
    {
        return !FunctionHelper.isNullOrEmpty(date) ? moment(date).format(format) : placeHolder;
    }


    static formatMinutesToHourAndMinutes = (totalOfMinutes) =>
    {
        if (FunctionHelper.isUndefined(totalOfMinutes))
        {
            return '--:--';
        }
        let d = moment.duration(Number(totalOfMinutes), 'minutes');
        let totalHours = Math.floor(d.asHours());
        let totalRestminutes = Math.floor(d.asMinutes()) - (totalHours * 60);
        return _.padStart(totalHours, 2, '0') + ':' + _.padStart(totalRestminutes, 2, '0');
    }

    static formatIntervalToDayHourAndMinutes = (startDate, endDate) =>
    {
        let totalOfMinutes = moment(endDate).diff(moment(startDate), 'minutes');
        return FunctionHelper.formatMinutesToDayHourAndMinutes(totalOfMinutes);
    }

    static formatMinutesToDayHourAndMinutes = (totalOfMinutes) =>
    {
        let d = moment.duration(Number(totalOfMinutes), 'minutes');
        let totalDays = Math.floor(d.asDays());
        let totalHours = Math.floor(d.asHours()) - (totalDays * 24);
        let totalMinutes = Math.floor(d.asMinutes()) - (totalDays * 24 * 60) - (totalHours * 60);

        let days = totalDays === 0 ? null : totalDays + ' dias';
        let hours = totalHours === 0 ? null : totalHours + ' hrs';
        let minutes = totalMinutes === 0 ? null : totalMinutes + ' mins';
        let data = [days, hours, minutes];
        return data.join(' ');
    }

    static formatDateToUseInQuery(objDate)
    {
        if (FunctionHelper.isDefined(objDate))
        {
            let momentDate = moment(objDate);
            return momentDate.format('YYYYMMDD');
        }
        return null;
    }

    static stringToUTCDateStartOfDay(strDate)
    {
        let momentDate = new moment(strDate).utc();
        return new Date(momentDate.year(), momentDate.month(), momentDate.date(), 0, 0, 0);
    }

    static stringToUTCDateEndOfDay(strDate)
    {
        let momentDate = new moment(strDate).utc();
        return new Date(momentDate.year(), momentDate.month(), momentDate.date(), 23, 59, 59);
    }

    static diffBetweenStartDayAndEndDay(firstDate, secoundDate)
    {
        if (FunctionHelper.isUndefined(firstDate) || FunctionHelper.isUndefined(secoundDate))
        {
            return null;
        }
        if (firstDate.toDateString() === secoundDate.toDateString())
        {
            return 0;
        }
        let firstDateM = this.getMomentDate(firstDate).clone();
        let secoundDateM = this.getMomentDate(secoundDate).clone();

        let isFirstDayAfter = firstDateM.isAfter(secoundDateM);
        let result = isFirstDayAfter ? firstDateM.endOf('day').diff(secoundDateM.startOf('day'), 'days') : secoundDateM.endOf('day').diff(firstDateM.startOf('day'), 'days');
        if (result < 1)
        {
            result = (parseFloat(secoundDateM.diff(firstDateM, 'hours')) / 24).toFixed(1);
        }
        if (isFirstDayAfter)
        {
            return -1 * Number(result);
        }
        return Number(result);
    }

    static diffBetweenTwoDates(firstDate, secoundDate)
    {
        if (FunctionHelper.isUndefined(firstDate) || FunctionHelper.isUndefined(secoundDate))
        {
            return null;
        }
        let firstDateM = moment(firstDate);
        let secoundDateM = moment(secoundDate);
        let result = secoundDateM.diff(firstDateM, 'days');
        if (result < 1)
        {
            result = parseFloat(secoundDateM.diff(firstDateM, 'hours')) / 24;
            return parseFloat(result.toFixed(1));
        }
        return result;
    }

    static getMomentDate(val)
    {
        let dateToCheck = (val instanceof Date) ? val.toString() : val;
        if (FunctionHelper.isUndefined(val))
        {
            return null;
        }
        if (dateToCheck.indexOf('00:00:00.000Z') > 0)
        {
             return moment(dateToCheck.replace('Z', ''));
        }
        return moment(val);
    }


    static getFormattedMomentDate(val, format)
    {
        if (FunctionHelper.isUndefined(val))
        {
            return null;
        }
        if (val instanceof Date)
        {
            return val;
        }
        return moment(val, format);
    }

    static ruleOfThree(actual, expected, toFixed)
    {
        if (FunctionHelper.isUndefined(expected) || expected === 0)
        {
            return 0;
        }
        return Number(Number((actual / expected) * 100).toFixed(toFixed));
    }

    static inverseRuleOfThree(actual, expected, fixed)
    {
        if (FunctionHelper.isUndefined(expected) || expected === 0)
        {
            return 0;
        }
        return Number(Number((actual * expected) / 100).toFixed(fixed));
    }

    static getComparativePercentual(actual, expected, toFixed)
    {
        //Somente para numeros inteiros maiores que zero
        if (FunctionHelper.isUndefined(expected) || expected === 0)
        {
            return null;
        }

        if (actual <= expected)
        {
            return Number('-' + ((Math.abs(actual) / expected) * 100).toFixed(toFixed));
        }

        if (actual > expected)
        {
            return Number((((actual / expected) * 100) - 100).toFixed(toFixed));
        }

        return 0;
    }

    static getPercentual(val, total, round)
    {
        if (FunctionHelper.isUndefined(val) || FunctionHelper.isUndefined(total) || total === 0)
        {
            return 0;
        }

        return Number(((val / total) * 100).toFixed(round || 0) || 0);
    }

    static fixPercentual(valueToBeFixed, values)
    {
        if (FunctionHelper.isUndefined(valueToBeFixed))
        {
            return null;
        }
        //Recebe o valor a ser corrigido e a lista de valores que somando deveria dar 100%. Caso o somatorio nao dê 100% retorna o valor que somado aos demais resulta em 100%
        let sum = _.sum(values);
        let delta = sum - 100;
        if ((sum < 100) || (delta > 0 && valueToBeFixed > delta))
        {
            return Number(((valueToBeFixed || 0) - delta).toFixed(0));
        }

        return Number(valueToBeFixed);
    }

    static pushUnique(collection, value)
    {
        if (_.indexOf(collection, value) === -1)
        {
            collection.push(value);
        }
    }

    static pushIfPredicateIsTrue(collection, value, predicateRsult)
    {
        if (predicateRsult)
        {
            collection.push(value);
        }
    }

    static sumValueToDictionary = (dictionary, key, value) =>
    {
        if (FunctionHelper.isUndefined(dictionary[key]))
        {
            dictionary[key] = 0;
        }
        dictionary[key] += value;
    };

    static minDate = (...dates) =>
    {
        let trueDates = _.map(_.compact(dates), (d) => FunctionHelper.getMomentDate(d).toDate());
        if (FunctionHelper.isArrayNullOrEmpty(trueDates))
        {
            return null;
        }
        return trueDates.reduce(function (a, b) { return a < b ? a : b; });
    }

    static maxDate = (...dates) =>
    {
        let trueDates = _.map(_.compact(dates), (d) => FunctionHelper.getMomentDate(d).toDate());
        if (FunctionHelper.isArrayNullOrEmpty(trueDates))
        {
            return null;
        }
        return trueDates.reduce(function (a, b) { return a > b ? a : b; });
    }

    static diff = (start, end, interval) =>
    {
        return moment(end).diff(moment(start), interval);
    }
}
