import {Enum} from 'enumify';
export default class EventType extends Enum
{

}
EventType.initEnum(['startPlanningDate', 'endPlanningDate', 'startExecutionDate', 'endExecutionDate', 'reminder', 'timesheet']);

