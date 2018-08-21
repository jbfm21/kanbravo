import {Enum} from 'enumify';
export default class AgingType extends Enum
{

}
AgingType.initEnum(['none', 'createdDate', 'startLeadTimeDate', 'startCycleTimeDate', 'lastLaneTransactionDate']);
