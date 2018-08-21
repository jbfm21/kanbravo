'use strict';
import React from 'react';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import _ from 'lodash';


import {ImmutableState} from '../../../../decorators';
import {FunctionHelper} from '../../../../commons';
import {BaseToolTip, DateTimeInput, Avatar} from '../../../../components';
import {KanbanActions} from '../../../../actions';
import {default as KCardStore} from '../KCardStore';

const messages = defineMessages(
{
    dontHaveEntities: {id: 'tooltip.impediment.dontHaveEntities', description: '', defaultMessage: 'Esse cartão não possui impedimentos'},
    loading: {id: 'tooltip.impediment.loading', description: '', defaultMessage: 'Aguarde. Carregando...'},
    title: {id: 'tooltip.impediment.title', description: '', defaultMessage: 'Impedimentos'},
    alt: {id: 'tooltip.impediment.alt', description: '', defaultMessage: 'Clique para visualizar os impedimentos do cartão'},
    typeLabel: {id: 'tooltip.impediment.typeLabel', description: '', defaultMessage: 'Tipo'},
    titleLabel: {id: 'tooltip.impediment.titleLabel', description: '', defaultMessage: 'Título'},
    startLabel: {id: 'tooltip.impediment.startLabel', description: '', defaultMessage: 'Início'},
    endLabel: {id: 'tooltip.impediment.endLabel', description: '', defaultMessage: 'Fim'},
    durationLabel: {id: 'tooltip.impediment.durationLabel', description: '', defaultMessage: 'Duração'}
});

const TOOLTIP_GROUP = 'cardToolTip'; //serve para usar a mesma instância de tooltip

@ImmutableState
class ImpedimentPopup extends BaseToolTip
{

    static displayName = 'ImpedimentPopup';

    static propTypes =
    {
        card: React.PropTypes.object.isRequired,
        parent: React.PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        let stateToExtend = {cardId: null, entities: null};
        super(props, messages, KCardStore, TOOLTIP_GROUP, stateToExtend);
    }

    _handleChangeImpedimentData = (item, newData) =>
    {
       this.setLoading();
       let itemToUpdate = FunctionHelper.cloneAndAssign(item, newData);
       KanbanActions.tooltip.updateImpediment.asFunction(itemToUpdate);
    }

    externalListenToStorageChange = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.tooltip.updateImpediment.completed:
            {
                const {card} = this.props;
                const savedImpediment = store.state.impediment;
                const cardId = savedImpediment.card;
                if (this.props.card._id === cardId)
                {
                    const savedImpedimentIndex = _.findIndex(card.impediments, {_id: savedImpediment._id});
                    card.impediments[savedImpedimentIndex] = savedImpediment;
                    let activeImpediments = _.filter(this.props.card.impediments, item =>FunctionHelper.isNullOrEmpty(item.endDate));
                    this.setEntities(activeImpediments);
                    this.clearBaseState();
                    this.props.parent.forceUpdate();
                }
                break;
            }
            case KanbanActions.tooltip.updateImpediment.failed:
            {
                if (this.state.data.cardId !== this.props.card._id)
                {
                    return;
                }
                this.setActionMessage(store.actionMessage);
                if (this.tooltip)
                {
                    this.forceUpdate();
                    this.tooltip.forceReRender();
                }
                break;
            }
            default: break;
        }
    };

    externalOnShowToolTip = () =>
    {
        let activeImpediments = _.filter(this.props.card.impediments, item =>FunctionHelper.isNullOrEmpty(item.endDate));
        this.setBaseState({cardId: this.props.card._id, entities: activeImpediments});
        this.clearBaseState();
    };


    externalRenderTooltipContent = () =>
    {
        let {entities} = this.state.data;
        return (
            <div style={{display: 'block', height: '200px', overflowY: 'scroll', overflowX: 'hidden', fontSize: '12px'}}>
                <table className="ui celled compact single line table" >
                    <thead>
                        <tr>
                            <th><FormattedMessage {...this.messages.typeLabel}/></th>
                            <th><FormattedMessage {...this.messages.titleLabel}/></th>
                            <th><FormattedMessage {...this.messages.startLabel}/></th>
                            <th><FormattedMessage {...this.messages.endLabel}/></th>
                            <th><FormattedMessage {...this.messages.durationLabel}/></th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        entities.map((impediment) =>
                        {
                            return (
                                <tr key={FunctionHelper.uuid()}>
                                    <td>
                                        {FunctionHelper.isDefined(impediment.type) &&
                                            <Avatar isToShowBackGroundColor isToShowBorder={true} isToShowSmallBorder isSquareImageDimension={true} avatar={impediment.type.avatar} hostStyle={{width: null, height: null, display: 'inline-flex'}} style={{width: '20px', padding: '0px'}} hostClassName="cardIcon" />}
                                    </td>
                                    <td>{FunctionHelper.isDefined(impediment.type) && impediment.type.title}</td>
                                    <td><DateTimeInput lessOrEqualThan={impediment.endDate} value={impediment.startDate} change={this._handleChangeImpedimentData.bind(this, impediment)} propName="startDate" classLoading="loading" classInvalid="k-inlineEdit invalid" /></td>
                                    <td><DateTimeInput requireBeforeValue greaterOrEqualThan={impediment.startDate} required={false} placeHolder={'--/--/-- --:--'} value={impediment.endDate} change={this._handleChangeImpedimentData.bind(this, impediment)} propName="endDate" classLoading="loading" classInvalid="k-inlineEdit invalid" /></td>
                                    <td>{FunctionHelper.fromDateOrNow(impediment.startDate, impediment.endDate)}</td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }

    render()
    {
        return this.baseRender();
    }
}

module.exports = injectIntl(ImpedimentPopup, {withRef: true});
