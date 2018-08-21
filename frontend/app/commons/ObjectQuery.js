import {_} from 'Lodash';
import {default as FunctionHelper} from './FunctionHelper';

export default class ObjectQuery
{
    static filterList(items, filterBy)
    {
        if (FunctionHelper.isUndefined(filterBy) || filterBy === '')
        {
            return items;
        }
        filterBy = filterBy.toLowerCase();
        let filteredItems = _.filter(items, function(item)
        {
            return item.toLowerCase().indexOf(filterBy) >= 0;
        });
        if (!FunctionHelper.isUndefined(filteredItems))
        {
            return filteredItems;
        }
        return items;
    }

    static getPaginatedItems(items, page, itemsPerPage, filterBy)
    {
        page = page || 1;
        itemsPerPage = itemsPerPage || 20;
        let offset = (page - 1) * itemsPerPage;
        let filteredItems = ObjectQuery.filterList(items, filterBy);
        let paginatedItems = _(filteredItems).slice(offset).slice(0, itemsPerPage).value();
        return {
            page: page,
            per_page: itemsPerPage,
            total: filteredItems.length,
            total_pages: Math.ceil(filteredItems.length / itemsPerPage),
            data: paginatedItems
        };
    }
}
