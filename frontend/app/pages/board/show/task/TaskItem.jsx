import React, {Component, PropTypes} from 'react';
import classNames from 'classNames';
import {injectIntl, intlShape} from 'react-intl';
import {Checkbox} from 'react-semantify';
import {FunctionHelper} from '../../../../commons';
import {Avatar} from '../../../../components';


class TaskItem extends Component
{
   static displayName = 'TaskItem';

    static propTypes =
    {
        data: PropTypes.object,
        intl: intlShape.isRequired,
        onSave: PropTypes.func.isRequired
    };

    constructor(props)
    {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) //eslint-disable-line
    {
        let nonce = FunctionHelper.isDefined(this.props.data) ? this.props.data.nonce : '';
        let nextNonce = FunctionHelper.isDefined(nextProps.data) ? nextProps.nonce : '';
        return (nonce !== nextNonce);
    }

    _handleToggle = () =>
    {
        let itemToUpdate = FunctionHelper.clone(this.props.data);
        itemToUpdate.completed = !itemToUpdate.completed;
        this.props.onSave(itemToUpdate);
	}

    render()
    {
        let {data} = this.props;
        const className = classNames({completed: data.completed});
        const checkBoxClassName = classNames({checked: data.completed});
        return (
            <tr>
                <td className={className}>
                    <Checkbox init={{onChange: this._handleToggle}} className={checkBoxClassName}><input type="checkbox" defaultChecked={data.completed} /></Checkbox>
                </td>
                <td className={className}>
                    {FunctionHelper.isDefined(data.type) &&
                            <div className={'centeredContainer'} style={{width: '24px', height: '24px'}}>
                                <Avatar isToShowBackGroundColor
                                    avatar={data.type.avatar}
                                    isToShowBorder
                                    isToShowSmallBorder
                                    isSquareImageDimension
                                    style={{width: '20px', padding: '0px'}}
                                    hostStyle={{width: null, height: null, display: 'inline-flex'}}/>
                            </div>
                    }
                </td>
                <td className={className} style={{maxWidth: '200px'}}>
                    <div style={{display: 'block', maxHeight: '60px', overflowY: 'auto', overflowX: 'hidden'}}>
                        <div>{data.title}</div>
                    </div>
                </td>
            </tr>
        );
    }

}

module.exports = injectIntl(TaskItem);

