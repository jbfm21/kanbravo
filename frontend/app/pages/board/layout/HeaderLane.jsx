'use strict';

//TODO: internacionalizar atributo title das tags

import React from 'react';
import * as airflux from 'airflux';
import classNames from 'classNames';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {Icon, Menu, List, Item, Label} from 'react-semantify';

import {UIActions} from '../../../actions';
import {FaIcon} from '../../../components';
import {FunctionHelper} from '../../../commons';

import {default as TitleInput} from './TitleInput.jsx';
import {default as WipLimitInput} from './WipLimitInput.jsx';
import {default as LaneTypeInput} from './LaneTypeInput.jsx';

const messages = defineMessages(
{
    moveLeft: {id: 'boardLayout.lane.moveLeft', description: '', defaultMessage: 'Mover para esquerda'},
    moveRight: {id: 'boardLayout.lane.moveUp', description: '', defaultMessage: 'Mover para direita'},
    moveDown: {id: 'boardLayout.lane.moveDown', description: '', defaultMessage: 'Mover para baixo'},
    moveUp: {id: 'boardLayout.lane.moveUp', description: '', defaultMessage: 'Mover para cima'},
    removeLane: {id: 'boardLayout.lane.removeLane', description: '', defaultMessage: 'Remove raia'},
    splitLaneHorizontal: {id: 'boardLayout.lane.splitLaneHorizontal', description: '', defaultMessage: 'Dividir raia horizontalmente'},
    splitLaneVertical: {id: 'boardLayout.lane.splitLaneVertical', description: '', defaultMessage: 'Dividir raia verticalmente'},
    subtractCardWide: {id: 'boardLayout.lane.subtractCardWide', description: '', defaultMessage: 'Diminuir tamanho da raia'},
    cardWide: {id: 'boardLayout.lane.cardWide', description: '', defaultMessage: 'Tamanho da raia'},
    addCardWide: {id: 'boardLayout.lane.addCardWide', description: '', defaultMessage: 'Aumentar tamanho da raia'},
    addSublane: {id: 'boardLayout.lane.addSublane', description: '', defaultMessage: 'Adicionar subraia'},
    cloneLane: {id: 'boardLayout.lane.cloneLane', description: '', defaultMessage: 'Clonar raia'},
    laneActivity: {id: 'boardLayout.lane.laneActivity', description: '', defaultMessage: 'Atividade da raia'},
    laneActivityLabel: {id: 'boardLayout.lane.laneActivityLabel', description: '', defaultMessage: 'Ativ'},
    laneWipLimit: {id: 'boardLayout.lane.laneWipLimit', description: '', defaultMessage: 'Limite do trabalho em progresso na raia'},
    laneWipLimitLabel: {id: 'boardLayout.lane.laneWipLimitLabel', description: '', defaultMessage: 'Lim:'},
    enable: {id: 'boardLayout.lane.enable', description: '', defaultMessage: 'Habilitar:'},
    disable: {id: 'boardLayout.lane.disable', description: '', defaultMessage: 'Desabilitar:'},
    addLanePolicy: {id: 'boardLayout.lane.addLanePolicy', description: '', defaultMessage: 'Cadastre uma política para a raia ou definição de pronto.'},
    laneTitle: {id: 'boardLayout.lane.laneTitle', description: '', defaultMessage: 'Título da raia'},
    isStartLeadTimeId: {id: 'boardLayout.lane.isStartLeadTimeId', description: '', defaultMessage: 'ILT'},
    isStartLeadTimeTitle: {id: 'boardLayout.lane.isStartLeadTimeTitle', description: '', defaultMessage: 'início do lead time'},
    isStartCycleTimeId: {id: 'boardLayout.lane.isStartCycleTimeId', description: '', defaultMessage: 'ICT'},
    isStartCycleTimeTitle: {id: 'boardLayout.lane.isStartCycleTimeTitle', description: '', defaultMessage: 'início do cycle time'},
    isEndCycleTimeId: {id: 'boardLayout.lane.isEndCycleTimeId', description: '', defaultMessage: 'FCT'},
    isEndCycleTimeTitle: {id: 'boardLayout.lane.isEndCycleTimeTitle', description: '', defaultMessage: 'término do cycle time'},
    isEndLeadTimeId: {id: 'boardLayout.lane.isEndLeadTimeId', description: '', defaultMessage: 'FLT'},
    isEndLeadTimeTitle: {id: 'boardLayout.lane.isEndLeadTimeTitle', description: '', defaultMessage: 'término do lead time'}
});


@airflux.FluxComponent
class HeaderLane extends React.Component
{
    static displayName = 'HeaderLane';

    static propTypes =
    {
        intl: intlShape.isRequired,
        lane: React.PropTypes.object.isRequired,
        isFirstLane: React.PropTypes.bool.isRequired,
        isLastLane: React.PropTypes.bool.isRequired,
        isMiddleLane: React.PropTypes.bool.isRequired,
        isLeafLane: React.PropTypes.bool.isRequired,
        isTopLevelLane: React.PropTypes.bool.isRequired,
        isHorizontalLane: React.PropTypes.bool.isRequired,
        isVerticalLane: React.PropTypes.bool.isRequired,
        isLoading: React.PropTypes.bool.isRequired,
        onCollapsed: React.PropTypes.func.isRequired,
        onMoveLeft: React.PropTypes.func.isRequired,
        onMoveRight: React.PropTypes.func.isRequired,
        onIncreaseCardWide: React.PropTypes.func.isRequired,
        onDecreaseCardWide: React.PropTypes.func.isRequired,
        onRemoveLane: React.PropTypes.func.isRequired,
        onAddChildLane: React.PropTypes.func.isRequired,
        onCloneLane: React.PropTypes.func.isRequired,
        onSplitLaneHorizontal: React.PropTypes.func.isRequired,
        onSplitLaneVertical: React.PropTypes.func.isRequired,
        onChangeTitle: React.PropTypes.func.isRequired,
        onChangePolicy: React.PropTypes.func.isRequired,
        onChangeActivity: React.PropTypes.func.isRequired,
        onChangeWipLimit: React.PropTypes.func.isRequired,
        onChangeLaneType: React.PropTypes.func.isRequired,
        onToggleDataMetric: React.PropTypes.func.isRequired
    };

    constructor(props)
    {
        super(props);
    }

    _handleMoveLeft = () => {this.props.onMoveLeft(this.props.lane);}
    _handleMoveRight = () => {this.props.onMoveRight(this.props.lane);}
    _handleIncreaseCardWide = () => {this.props.onIncreaseCardWide(this.props.lane);}
    _handleDecreaseCardWide = () => {this.props.onDecreaseCardWide(this.props.lane);}
    _handleRemoveLane = () => {this.props.onRemoveLane(this.props.lane);}
    _handleAddChildLane = () => {this.props.onAddChildLane(this.props.lane);}
    _handleCloneLane = () => {this.props.onCloneLane(this.props.lane);}
    _handleSplitLaneHorizontal = () => {this.props.onSplitLaneHorizontal(this.props.lane);}
    _handleSplitLaneVertical = () =>{this.props.onSplitLaneVertical(this.props.lane);}
    _handleChangeTitle = (newData) => {this.props.onChangeTitle(this.props.lane, newData.title);}
    _handleChangeActivity = (newData) => {this.props.onChangeActivity(this.props.lane, newData.activity);}
    _handleChangePolicy = (policy) => {this.props.onChangePolicy(this.props.lane, policy);}
    _handleChangeWipLimit = (newData) => {this.props.onChangeWipLimit(this.props.lane, newData.wipLimit);}
    _handleChangeLaneType = (newData) => {this.props.onChangeLaneType(this.props.lane, newData.laneType);}
    _handleToggleDataMetric = (dateMetricPropertyName, e) => {e.preventDefault(); this.props.onToggleDataMetric(this.props.lane, dateMetricPropertyName);}

    _isStringAcceptable = (string) =>
    {
        return (string.length >= 1);  // Minimum 4 letters long
    };

    _isStringAcceptableWith4CharMaxLength = (string) =>
    {
        return (string.length >= 0) && (string.length <= 4);  // Minimum 4 letters long
    };

    _handlePolicyEditModalShow = (e) =>
    {
        //TODO: limitar a 1000 caracteres a politica no editor
        if (e) {e.preventDefault();}
        let text = this.props.lane.policy;
        UIActions.showTextEditModal.asFunction(text, this._handlePolicyEditModalTextChanged.bind(this), this._handleTextEditModalCancel.bind(this), {maxLength: 1000});
    };

    _handlePolicyEditModalTextChanged = (text) =>
    {
        this._handleChangePolicy(text);
    };

    _handleTextEditModalCancel = () =>
    {
    };

    _renderLeftOrUpArrow = () =>
    {
        if (this.props.isFirstLane)
        {
            return null;
        }
        const {formatMessage} = this.props.intl;
        const leftArrow = (this.props.isHorizontalLane) ? 'blue fa-long-arrow-left' : 'blue fa-long-arrow-up';
        const leftArrowTitle = (this.props.isHorizontalLane) ? formatMessage(messages.moveLeft) : formatMessage(messages.moveUp);
        return (<Item title={leftArrowTitle} className="k-compact k-bordless pointer mouse" style={{lineHeight: 1.8, color: 'blue', fontSize: '16px'}} onClick={this._handleMoveLeft}><FaIcon className={`fa-1 ${leftArrow}`}/></Item>);
    };

    _renderRightOrDownArrow = () =>
    {
        if (this.props.isLastLane)
        {
            return null;
        }
        const {formatMessage} = this.props.intl;
        const rightArrow = (this.props.isHorizontalLane) ? 'blue fa-long-arrow-right' : 'blue fa-long-arrow-down';
        const rightArrowTitle = (this.props.isHorizontalLane) ? formatMessage(messages.moveRight) : formatMessage(messages.moveDown);
        return (<Item title={rightArrowTitle} style={{color: 'blue', fontSize: '16px'}} className="k-compact k-bordless pointer mouse" onClick={this._handleMoveRight}><FaIcon className={`fa-1 ${rightArrow}`} style={{lineHeight: 1.8, marginLeft: '3px', marginRight: '3px'}}/></Item>);
    }

    _renderLaneType = () =>
    {
        if (!this.props.isLeafLane)
        {
            return null;
        }
        const {lane, isLoading} = this.props;
        return (<LaneTypeInput value={lane.laneType} isDisabled={isLoading} change={this._handleChangeLaneType} propName="laneType" classLoading="isLoading" classInvalid="k-inlineEdit invalid" />);
    }

    _renderLeafLaneMenu = () =>
    {
        if (!this.props.isLeafLane)
        {
            return null;
        }
        const {formatMessage} = this.props.intl;
        const {lane} = this.props;
        return (<div style={{display: 'inherit'}}>
            <Item title={formatMessage(messages.removeLane)} className="k-compact pointer mouse" style={{borderRight: '1px solid gray'}} onClick={this._handleRemoveLane}><Icon className="red remove circle" style={{marginLeft: '2px', marginRight: '2px'}}/></Item>
            <Menu className="icon" style={{borderRadius: '0px', padding: '0px', border: '0px', borderRight: '1px solid gray', margin: '0px', minHeight: '25px', height: '25px'}}>
                <Item title={formatMessage(messages.splitLaneHorizontal)} className="k-compact pointer mouse" onClick={this._handleSplitLaneHorizontal}><FaIcon className="fa-1 fa-rotate-90 fa-bars" style={{marginLeft: '5px'}}/></Item>
                <Item title={formatMessage(messages.splitLaneVertical)} className="k-compact pointer mouse" onClick={this._handleSplitLaneVertical}><FaIcon className="fa-1  fa-bars" style={{marginLeft: '5px', marginRight: '5px'}}/></Item>
            </Menu>
            {
                lane.cardsWide > 1 &&
                    <Item title={formatMessage(messages.subtractCardWide)} className="k-compact k-bordless pointer mouse" onClick={this._handleDecreaseCardWide}><FaIcon style={{marginLeft: '5px'}} className="fa-1 fa-step-backward" /></Item>
            }
            <Item title={formatMessage(messages.cardWide)} className="k-compact k-bordless" style={{marginLeft: '5px !important'}}><span style={{marginLeft: '5px', marginRight: '5px'}}>{lane.cardsWide}</span></Item>
            <Item title={formatMessage(messages.addCardWide)} className="k-compact  pointer mouse" onClick={this._handleIncreaseCardWide} style={{borderRight: '1px solid gray'}}><FaIcon className="fa-1 fa-step-forward" style={{marginRight: '5px'}}/></Item>
        </div>);
    }

    _renderNotLeafLaneMenu = () =>
    {
        if (this.props.isLeafLane)
        {
            return null;
        }
        const {formatMessage} = this.props.intl;
        const {lane} = this.props;
        return (
            <div style={{display: 'inherit'}}>
                <Item title={formatMessage(messages.addSublane)}className="k-compact pointer mouse" style={{borderRight: '1px solid gray'}} onClick={this._handleAddChildLane}><Icon className="blue add circle" style={{marginLeft: '2px', marginRight: '2px'}}/></Item>
                <Item title={formatMessage(messages.cloneLane)} className="k-compact pointer mouse" style={{borderRight: '1px solid gray'}} onClick={this._handleCloneLane}><Icon className="gray copy circle" style={{marginLeft: '2px', marginRight: '2px'}}/></Item>
                <Item title={formatMessage(messages.cardWide)} className="k-compact k-bordless" style={{marginLeft: '5px !important'}}><span style={{marginLeft: '5px', marginRight: '5px'}}>{lane.cardsWide}</span></Item>
            </div>
        );
    }

    _renderActivityAndWipMenu = () =>
    {
        const {lane, isLoading} = this.props;
        const {formatMessage} = this.props.intl;
        return (
            <Menu className="right bordless icon" style={{borderRadius: '0px', padding: '0px', border: '0px', margin: '0px', minHeight: '25px', height: '25px', marginRight: '3px'}}>
                <Item title={formatMessage(messages.laneActivity)} style={{width: '40px', padding: '0px', borderRight: '1px solid gray', fontSize: '10px'}} >
                    <TitleInput placeHolder={formatMessage(messages.laneActivityLabel)} value={lane.activity} isDisabled={isLoading} maxLength={4} change={this._handleChangeActivity} propName="activity" validate={this._isStringAcceptableWith4CharMaxLength} classLoading="isLoading" classInvalid="k-inlineEdit invalid" />
                </Item>
                <Item style={{padding: '1px'}} title={formatMessage(messages.laneWipLimit)}>
                    <div className={'ui small basic label right position default mouse'} style={{margin: '0px', background: 'transparent', color: 'black', padding: '0px'}}>
                        {formatMessage(messages.laneWipLimitLabel)}:
                        {
                            <WipLimitInput isDisabled={isLoading} value={lane.wipLimit} change={this._handleChangeWipLimit} propName="wipLimit" validate={this._isStringAcceptable} classLoading="isLoading" classInvalid="k-inlineEdit invalid" />
                        }
                    </div>
                </Item>
            </Menu>
        );
    }

    _renderDateMetricConfigItem = (iconLetter, iconText, iconProperty, isEnabled) =>
    {
        const iconStyle = {margin: '0px'};
        const className = classNames({green: isEnabled, notSelected: !isEnabled});
        const {formatMessage} = this.props.intl;
        const popoverText = (isEnabled) ? formatMessage(messages.disable) + ' ' + iconText : formatMessage(messages.enable) + ' ' + iconText;
        return (<Item style={{padding: '0px', marginLeft: '5px', cursor: 'pointer'}}>
            <Label className={className} style={iconStyle} title={popoverText} onClick={this._handleToggleDataMetric.bind(this, iconProperty)}>{iconLetter}</Label>
        </Item>);
    }

    render()
	{
        const {lane, isFirstLane, isMiddleLane, isLeafLane, isTopLevelLane, isHorizontalLane, isVerticalLane, isLastLane, isLoading} = this.props; //eslint-disable-line
        const {isStartLeadTime, isEndLeadTime, isStartCycleTime, isEndCycleTime} = lane.dateMetricConfig;

        const {formatMessage} = this.props.intl;
        const hasPolicy = FunctionHelper.isDefined(lane.policy) && lane.policy.trim().length > 0;
        const policyStyle = {opacity: hasPolicy ? '1' : '0.2'};
        const policyPopoverText = (hasPolicy) ? lane.policy : formatMessage(messages.addLanePolicy);

        let containerClassName = classNames({
            header: true,
            'default mouse': true,
            editLayout: true,
            top: isTopLevelLane,
            notTop: !isTopLevelLane,
            horizontal: isHorizontalLane,
            vertical: isVerticalLane,
            first: isFirstLane,
            middle: isMiddleLane,
            last: isLastLane,
            leaf: isLeafLane,
            parent: !isLeafLane
        });

        const upperCaseStyle = isTopLevelLane ? 'uppercase' : '';

        return (
            <div className={containerClassName}>
                <List className="horizontal" style={{padding: '0px', display: 'inline-flex', width: '100%', borderBottom: '0px solid black'}}>
                    {this._renderLeftOrUpArrow()}
                    {this._renderLaneType()}
                    <Item title={formatMessage(messages.laneTitle)} style={{width: '100%'}}>
                        <div className={`title ${upperCaseStyle} text`} style={{whiteSpace: 'nowrap', height: '22px', width: 'inherit'}} >
                            <TitleInput value={lane.title} isDisabled={isLoading} change={this._handleChangeTitle} propName="title" validate={this._isStringAcceptable} classLoading="isLoading" classInvalid="k-inlineEdit invalid" />
                        </div>
                    </Item>
                    <Item>
                        <Icon className={'info circle icon right position'} style={policyStyle} title={policyPopoverText} onClick={this._handlePolicyEditModalShow} />
                    </Item>
                    {this._renderRightOrDownArrow()}
                </List>
                <Menu className="icon metricLayoutLaneMenu" style={{borderRadius: '0px', padding: '0px', border: '0px', margin: '0px', minHeight: '25px', height: '25px'}}>
                    {this._renderDateMetricConfigItem(formatMessage(messages.isStartLeadTimeId), formatMessage(messages.isStartLeadTimeTitle), 'isStartLeadTime', isStartLeadTime)}
                    {this._renderDateMetricConfigItem(formatMessage(messages.isStartCycleTimeId), formatMessage(messages.isStartCycleTimeTitle), 'isStartCycleTime', isStartCycleTime)}
                    {this._renderDateMetricConfigItem(formatMessage(messages.isEndCycleTimeId), formatMessage(messages.isEndCycleTimeTitle), 'isEndCycleTime', isEndCycleTime)}
                    {this._renderDateMetricConfigItem(formatMessage(messages.isEndLeadTimeId), formatMessage(messages.isEndLeadTimeTitle), 'isEndLeadTime', isEndLeadTime)}
                </Menu>
                <Menu className="icon boardLayoutLaneMenu" style={{borderRadius: '0px', padding: '0px', border: '0px', margin: '0px', minHeight: '25px', height: '25px'}}>
                    {this._renderLeafLaneMenu()}
                    {this._renderNotLeafLaneMenu()}
                    {this._renderActivityAndWipMenu()}
                </Menu>
            </div>
        );
    }
}

module.exports = injectIntl(HeaderLane);
