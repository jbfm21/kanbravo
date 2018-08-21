import {Enum} from 'enumify';
export default class LaneType extends Enum
{

}
LaneType.initEnum(['inprogress', 'wait', 'ready', 'tracking', 'completed']);
