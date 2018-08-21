import React from 'react';

import {RIEStatefulBase} from '../../../components';

import {BoardLayoutHelper} from '../../../commons';
import {Avatar} from '../../../components';
import {LaneType} from '../../../enums';

//TODO: Intercionalizar

export default class LaneTypeInput extends RIEStatefulBase
{
    static display = 'LaneTypeInput';

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
        return (
            <select
                disabled={this.state.loading || this.props.isDisabled}
                className={this.makeClassString()}
                style={{border: '1px solid black', fontSize: '9px', padding: '0px', margin: '0px'}}
                defaultValue={this.props.value}
                onInput={this.textChanged}
                onBlur={this.finishEditing}
                ref="input"
                onKeyDown={this.keyDown}
            >
                <option value={LaneType.inprogress.name}>progresso</option>
                <option value={LaneType.wait.name}>aguardando</option>
                <option value={LaneType.tracking.name}>tracking</option>
                <option value={LaneType.ready.name}>pronto</option>
                <option value={LaneType.completed.name}>finalizado</option>
            </select>
        );
    };

    renderNormalComponent = () =>
    {
        let laneTypeAvatar = BoardLayoutHelper.getLaneTypeAvatar(this.props.value, 'fa-cog');
        return (<Avatar disabled={this.state.loading || this.props.isDisabled} onClick={this.startEditing} isToShowBackGroundColor hostStyle={{width: null, height: null, margin: '0px 0px 0px 0px', lineHeight: 1.8, padding: '0px'}} hostClassName="item default mouse" style={{width: '7px', height: '7px', fontSize: '10px', lineHeight: '1.4', marginLeft: '5px'}} avatar={laneTypeAvatar}/>);
    };
}
