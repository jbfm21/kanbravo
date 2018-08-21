import {Enum} from 'enumify';
export default class CardStatus extends Enum
{

}
CardStatus.initEnum(['backlog', 'inboard', 'deleted', 'archived', 'canceled']);

