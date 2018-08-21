'use strict';
const moment = require('moment');
class MomentUtil
{
    static isInInterval(date, startDate, endDate)
    {
        return moment(date).isBetween(startDate, endDate, 'days', '[]');
    }
    static splitMomentDateRange(startDate, endDate)
    {
        let dates = [];
        let dateDayWalker = startDate.clone();
        if (!startDate.isValid() || !endDate.isValid())
        {
            return [];
        }

        let diff = endDate.clone().startOf('day').diff(startDate.clone().startOf('day'), 'days');
        if (diff <= 0)
        {
            dates.push({startDateTime: startDate, endDateTime: endDate});
            return dates;
        }

        for (let i = 0; i <= diff; i++)
        {
            if (i === 0)
            {
                dates.push({startDateTime: startDate, endDateTime: startDate.clone().endOf('day')});
            }
            else if (i === diff)
            {
                dates.push({startDateTime: endDate.clone().startOf('day'), endDateTime: endDate});
            }
            else
            {
                dates.push({startDateTime: dateDayWalker.clone().startOf('day'), endDateTime: dateDayWalker.clone().endOf('day')});
            }
            dateDayWalker.add(1, 'd');
        }
        return dates;
    }
}

module.exports = MomentUtil;
