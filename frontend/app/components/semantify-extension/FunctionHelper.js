'use strict';

import classSet from 'classnames';


const colorArray = [
  'black', 'yellow', 'green', 'blue',
  'orange', 'purple', 'red', 'teal'
];

export default class FunctionHelper
{
    static getClassName(props, defaultClassName, addClassName)
    {
        let classResult = '';

        if (typeof props.className !== 'undefined')
        {
            classResult += ' ' + props.className;
        }

        if (typeof addClassName !== 'undefined')
        {
            if (typeof addClassName === 'object')
            {
                classResult += ' ' + classSet(addClassName);
            }
            else
            {
                classResult += ' ' + addClassName;
            }
        }
        return defaultClassName.replace('{customClass}', classResult);
    }

    static getColor(props)
    {
        let color = 'null';

        if (typeof props.color !== 'undefined')
        {
            if (colorArray.indexOf(props.color) !== -1)
            {
                color = props.color;
            }
        }
        return color;
    }

    static isUndefined(obj)
    {
        return obj === null || typeof obj === 'undefined' || obj === 'undefined';
    }

    static isDefined(obj)
    {
        return !FunctionHelper.isUndefined(obj);
    }

}

