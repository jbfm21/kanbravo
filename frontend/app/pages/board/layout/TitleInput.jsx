import React from 'react';

import {RIEStatefulBase} from '../../../components';

export default class TitleInput extends RIEStatefulBase
{
    static display = 'TitleInput';

    static propTypes =
    {
        placeHolder: React.PropTypes.string,
        maxLength: React.PropTypes.number
    };

    constructor(props)
    {
        super(props);
    }

    renderEditingComponent = () =>
    {
        return <input
            placeholder={this.props.placeHolder}
            disabled={this.state.loading || this.props.isDisabled}
            className={this.makeClassString()}
            style={{border: '1px solid black', textAlign: 'center', width: 'inherit'}}
            defaultValue={this.props.value}
            onInput={this.textChanged}
            onBlur={this.finishEditing}
            maxLength={this.props.maxLength}
            ref="input"
            onKeyDown={this.keyDown} />;
    };

    renderNormalComponent = () =>
    {
        return <input
            tabIndex="0"
            placeholder={this.props.placeHolder}
            disabled={this.state.loading || this.props.isDisabled}
            defaultValue={this.state.newValue || this.props.value}
            className={this.makeClassString()}
            style={{cursor: 'pointer', border: '1px solid transparent', textAlign: 'center', width: 'inherit', backgroundColor: 'transparent'}}
            onFocus={this.startEditing}
            onClick={this.startEditing}/>;
    };
}
