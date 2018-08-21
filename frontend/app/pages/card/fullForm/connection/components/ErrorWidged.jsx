//TODO: intercionalizar
import React, {Component, PropTypes} from 'react';
import {FunctionHelper} from '../../../../../commons';
import _ from 'lodash';

class ErrorWidged extends Component
{
    static displayName = 'ErrorWidged';

    static propTypes =
    {
        statisticManager: PropTypes.object.isRequired
    };

    constructor(props)
    {
       super(props);
    }

    render()
    {
        let errors = this.props.statisticManager.getAllErrors();
        if (FunctionHelper.isArrayNullOrEmpty(errors))
        {
            return null;
        }
        return (
            <div className="ui negative message" style={{fontSize: '11px'}}>
                <ul className="list">
                    {_.map(errors, (item) => <li key={FunctionHelper.uuid()}>{item}</li>)}
                </ul>
            </div>
        );
    }
}

module.exports = ErrorWidged;
