/*******
 * TODO: COLOCAR OS ESTILOS COMO PARÂMETRO AO INVÉS DE DEIXAR FIXO
 *
 *
 * As classes que herdarem dessa classe terão que disponibilizar os seguintes métodos
 * externalListenToStorageChange (obrigatório)
 * externalOnShowToolTip (obrigatório)
 * externalOnHideToolTip (opcional)
 * externalRenderTooltipContent (obrigatório)
 * externalRenderEmptyMessage (opcional)
 * render (obrigatório)
 *
 * e deverão configurar no estado a variável entities para indicar que as informações a serem exibidas foram carregadas
 *
 * E no construtor passar um objeto message conforme exemplo abaixo
 * const messages = defineMessages(
 *{
    dontHaveEntities: {id: 'tooltip.customField.task.dontHaveEntities', description: '', defaultMessage: 'Esse cartão não possui tarefas'},
    loading: {id: 'tooltip.tasks.loading', description: '', defaultMessage: 'Aguarde. Carregando...'},
    title: {id: 'tooltip.tasks.title', description: '', defaultMessage: 'Tarefas'}
 });
 */


'use strict';
import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {Header, Icon} from 'react-semantify';
import {FormattedMessage} from 'react-intl';

import {ImmutableState} from '../../decorators';
import {FunctionHelper} from '../../commons';
import {Description, ToolTip, FormToast, LoadServerContent} from '../../components';

@airflux.FluxComponent
@ImmutableState
class BasePopup extends React.Component
{

    static displayName = 'TaskPopup';

    static propTypes =
    {
        visualStyle: React.PropTypes.object,
        isReadOnly: React.PropTypes.bool,
        showOnMouseEnter: React.PropTypes.bool,
        closeOnMouseLeave: React.PropTypes.bool
    };

    constructor(props, messages, storeToListen, groupToolTipId, stateToExtend)
    {
        let extendedStateRecord = FunctionHelper.extend({}, {isPopupActive: false, isLoading: false, entities: null, actionMessage: ''}, stateToExtend);
        let StateRecord = Immutable.Record(extendedStateRecord);
        super(props);
        this.messages = messages;
        this.groupToolTipId = groupToolTipId;
        this.storeToListen = storeToListen;
        this.state = {data: new StateRecord({entities: null})};
    }

    clearBaseState = () =>
    {
        this.setImmutableState({isLoading: false, actionMessage: ''});
    }

    setLoading = () =>
    {
        this.setImmutableState({isLoading: true, actionMessage: ''});
    }

    setActionMessage = (actionMessage) =>
    {
        this.setImmutableState({isLoading: false, actionMessage: actionMessage});
    }

    setEntities = (entities) =>
    {
        this.setImmutableState({entities: entities});
        this.clearBaseState();
    }

    setBaseState = (state) =>
    {
        this.setImmutableState(state);
    }

    showToolTip = () =>
    {
        this._handleShowTooltip();
    }

    _handleShowTooltip = () =>
    {
        if (this.props.isReadOnly) {return;}
        this.setImmutableState({isLoading: true, isPopupActive: true, actionMessage: ''}); //os estados precisam ser configurados aqui por conta do contexto do tooltip, não posso colocar no listener, pois todos são avisados
        if (FunctionHelper.isUndefined(this.unsubscribe) && FunctionHelper.isDefined(this.externalListenToStorageChange))
        {
            this.unsubscribe = this.storeToListen.listen(this.externalListenToStorageChange);
        }
        if (this.externalOnShowToolTip)
        {
            this.externalOnShowToolTip();
        }
    }

    _handleHideTooltip = () =>
    {
        this.setImmutableState({isPopupActive: false, actionMessage: null, isLoading: false});
        if (FunctionHelper.isDefined(this.unsubscribe))
        {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        if (this.externalOnHideToolTip)
        {
            this.externalOnHideToolTip();
        }
    }

    _renderToolTip = () =>
    {
        let {entities, isLoading} = this.state.data;
        if (isLoading && FunctionHelper.isArrayNullOrEmpty(entities))
        {
            return (
                <div style={{whiteSpace: 'pre'}}>
                    <FormattedMessage {...this.messages.loading}/>
                </div>
            );
        }
        if (FunctionHelper.isArrayNullOrEmpty(entities) && !isLoading)
        {
            if (this.externalRenderEmptyMessage)
            {
                return this.externalRenderEmptyMessage();
            }
            return (
                <div style={{whiteSpace: 'pre'}}>
                    <FormattedMessage {...this.messages.dontHaveEntities}/><br/>
                </div>
            );
        }
        return this.externalRenderTooltipContent();
    }

    baseRender = () =>
    {
        let {isPopupActive, actionMessage, isLoading} = this.state.data;
        let onMouseEnterFunction = this.props.showOnMouseEnter ? this._handleShowTooltip : null;
        let closeOnMouseLeaveFunction = this.props.closeOnMouseLeave ? this._handleHideTooltip : null;
        const {formatMessage} = this.props.intl;
        let toolTipStyle = {
            style: {minWidth: '200px', background: 'rgba(255,255,255,1)', padding: '0px', marginTop: '5px', marginBottom: '0px', boxShadow: '5px 5px 3px rgba(0,0,0,.5)'},
            arrowStyle: {color: 'rgba(0,0,0,.8)', borderColor: false}
        };
        const tooltipId = 'a' + FunctionHelper.uuid();
        const descriptionStyle = this.externalDescriptionStyle ? this.externalDescriptionStyle() : {marginLeft: '5px', maxHeight: '310px', overflowY: 'auto'};
        return (
            <div id={tooltipId}
                onClick={this._handleShowTooltip}
                onMouseEnter={onMouseEnterFunction}
                title={formatMessage(this.messages.alt)}
                className="not padding item"
            >
                <LoadServerContent isLoading={isLoading}/>
                {this.props.children}
                <ToolTip onToolTipMouseLeave={closeOnMouseLeaveFunction} ref={(ref) => {this.tooltip = ref; return;}} group={this.groupToolTipId} style={toolTipStyle} tooltipTimeout={200} active={isPopupActive} position="bottom" parent={`#${tooltipId}`}>
                    <Header onClick={this._handleHideTooltip} className="k-background" style={{padding: '0px', borderBottom: '1px solid black', marginBottom: '0px'}}>
                        <div className="content">
                            <span style={{marginLeft: '3px', color: 'white', fontSize: '16px'}}>
                                <FormattedMessage {...this.messages.title}/>
                            </span>
                        </div>
                        <Icon className="close ui top right attached label" style={{marginRight: '5px', color: 'white', fontSize: '16px', background: 'transparent', padding: '0px'}}/>
                    </Header>
                    <Description style={descriptionStyle}>
                        <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                        {this._renderToolTip()}
                    </Description>
                </ToolTip>
            </div>
        );
    }
}

module.exports = BasePopup;
