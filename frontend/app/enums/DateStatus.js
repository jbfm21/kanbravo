import {Enum} from 'enumify';
export default class DateStatus extends Enum
{

}
DateStatus.initEnum(['ontime', 'warning', 'late', 'deliveryOnTime', 'deliveryLate']);
