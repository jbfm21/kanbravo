'use strict';

import _ from 'lodash';
import moment from 'moment';

import {default as FunctionHelper} from './FunctionHelper';

export default class TimesheetHelper
{
    static generateTimeSheetData(member, strStartDateTime, strHourMinutes)
    {
       let trackerStartDateMoment = moment(strStartDateTime, 'YYYY-MM-DDTHH:mm');
       let duration = moment.duration(strHourMinutes);
       let durationInMinutes = duration.asMinutes();

       let trackerStartDate = trackerStartDateMoment.toDate();
       let minutes = durationInMinutes;
       let trackerMinutes = durationInMinutes;

       let startDate = new Date(trackerStartDateMoment.year(), trackerStartDateMoment.month(), trackerStartDateMoment.date(), 0, 0, 0);
       let trackerEndDate = trackerStartDateMoment.clone().add(moment.duration(durationInMinutes, 'minutes')).toDate();

       return {user: member.user._id, startDate: startDate, minutes: minutes, trackerStartDate: trackerStartDate, trackerEndDate: trackerEndDate, trackerMinutes: trackerMinutes};

    }
    static generateConsecutiveDatesToRange(timeSheetDocs)
    {
        if (timeSheetDocs.length === 0)
        {
            return [];
        }
        let ranges = [];
        let userTimeSheets = _.groupBy(timeSheetDocs, 'user._id');
        for (let item in userTimeSheets) //eslint-disable-line
        {
           let rangeAux = TimesheetHelper._generateConsecutiveDatesToRangeAux(userTimeSheets[item]);
           ranges = ranges.concat(rangeAux);
        }
        return ranges;
    }

    static _generateConsecutiveDatesToRangeAux(timeSheetDocs)
    {
        if (timeSheetDocs.length === 0)
        {
            return [];
        }

        let orderedTimeSheetDocs = _.sortBy(timeSheetDocs, function(item) {return item.startDate; });

        let ranges = [];
        let firstItem = orderedTimeSheetDocs[0];
        let range = {user: firstItem.user, startDate: FunctionHelper.stringToUTCDateStartOfDay(firstItem.startDate),
                   endDate: FunctionHelper.stringToUTCDateEndOfDay(firstItem.startDate), minutes: firstItem.minutes};

        for (let i = 1; i < orderedTimeSheetDocs.length; i++)
        {
            let timeSheetItem = orderedTimeSheetDocs[i];
            let rangeEndDate = moment(range.endDate).utc();
            let nextDate = moment(FunctionHelper.stringToUTCDateEndOfDay(timeSheetItem.startDate)).utc();

            var diff = nextDate.diff(rangeEndDate, 'days');
            if (diff === 0)
            {
                range.minutes += timeSheetItem.minutes;
            }
            else if (diff === 1)
            {
                range.minutes += timeSheetItem.minutes;
                range.endDate = FunctionHelper.stringToUTCDateEndOfDay(timeSheetItem.startDate);
            }
            else
            {
                ranges.push(range);
                range = {user: timeSheetItem.user, startDate: FunctionHelper.stringToUTCDateStartOfDay(timeSheetItem.startDate),
                endDate: FunctionHelper.stringToUTCDateEndOfDay(timeSheetItem.startDate), minutes: timeSheetItem.minutes};
            }
        }
        ranges.push(range);

        return ranges;
    }
}
