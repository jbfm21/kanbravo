import {Enum} from 'enumify';
export default class FieldType extends Enum
{

}
FieldType.initEnum(['numeric', 'short_string', 'text', 'date', 'datetime', 'dropdown']);
