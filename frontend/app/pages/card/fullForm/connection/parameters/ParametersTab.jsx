import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
//import {Content} from 'react-semantify';

import {KanbanActions} from '../../../../../actions';
import {ImmutableState} from '../../../../../decorators';
import {NumberInput, StaticComboField} from '../../../../../components';
//import {FunctionHelper} from '../../../../../commons';
import {default as ComboField} from '../../components/ComboField.jsx';

const messages = defineMessages(
{
    childrenCardMetricTypeLabel: {id: 'modal.cardForm.connection.parameter.childrenCardMetricTypeLabel', description: '', defaultMessage: 'Analisar cartões conectados com a seguinte métrica'},
    childrenCardMetricTypeHint: {id: 'modal.cardForm.connection.parameter.childrenCardMetricTypeLabel', description: '', defaultMessage: 'Somente os cartões conectados com essa métrica serão contabilizados para cálculo do % realizado'},
    childrenCardMetricValueLabel: {id: 'modal.cardForm.connection.parameter.childrenCardMetricValueLabel', description: '', defaultMessage: 'Tamanho total estimado dos cartões conectados:'},
    childrenCardMetricValueHint: {id: 'modal.cardForm.connection.parameter.childrenCardMetricValueLabel', description: '', defaultMessage: 'Valor estimado deste cartão que será utilizado para calcular o desvio de escopo. Esse valor é util nos casos em que ainda não foram criados/conectados todos os cartões.'},
    childrenCardMetricValueEmpty: {id: 'modal.cardForm.connection.parameter.childrenCardMetricValueEmpty', description: '', defaultMessage: 'Sem volume estimado'},
    sameFromCardPlaceHolder: {id: 'modal.cardForm.connection.parameter.select.sameFromCardPlaceHolder', description: '', defaultMessage: 'Mesma do cartão'},
    grandChildrenCardsBasedCalculationLabel: {id: 'modal.cardForm.connection.parameter.select.grandChildrenCardsBasedCalculation', description: '', defaultMessage: 'Calcular realização com base no terceiro nível de conexão'},
    grandChildrenCardsBasedCalculationHint: {id: 'modal.cardForm.connection.parameter.select.grandChildrenCardsBasedCalculation', description: '', defaultMessage: 'Utilizado para calcular o valor realizado baseado na execução dos cartões conectados a partir das conexões destes cartão. ATENÇÃO: Caso este cartão seja o penúltimo nível ou último nível não colocar SIM, por questão de performance'},
    yes: {id: 'modal.cardForm.connection.parameter.select.yes', description: '', defaultMessage: 'Sim'},
    no: {id: 'modal.cardForm.connection.parameter.select.no', description: '', defaultMessage: 'Não'},
    tableTitle: {id: 'modal.cardForm.connection.parameter.childrenCardMetricValueEmpty', description: '', defaultMessage: 'Parâmetro'},
    tableValue: {id: 'modal.cardForm.connection.parameter.childrenCardMetricValueEmpty', description: '', defaultMessage: 'Valor'},
    tableHint: {id: 'modal.cardForm.connection.parameter.childrenCardMetricValueEmpty', description: '', defaultMessage: 'Descrição'}
});

//TODO: iniciar com selectedBoardId = do cartao

var StateRecord = Immutable.Record({isLoadingCards: false, actionMessage: true});

@ImmutableState
@airflux.FluxComponent
class ManageConnectionTab extends Component
{
    static displayName = 'ManageConnectionTab';

    static propTypes =
    {
        intl: intlShape.isRequired,
        card: PropTypes.object.isRequired,
        connections: PropTypes.any.isRequired,
        onChangeCardData: PropTypes.func.isRequired
    };

    constructor(props)
    {
       super(props);
       this.state = {data: new StateRecord()};
    }

    _handleSelectedItem = (fieldName, selectedItem) =>
    {
        this._handleChangeData({[fieldName]: selectedItem});
    }

    _handleChangeData = (newData) =>
    {
       this.props.onChangeCardData(newData);
    }

    _getBooleanSuggestion = () =>
    {
        const {formatMessage} = this.props.intl;
        return [{value: true, label: formatMessage(messages.yes)}, {value: false, label: formatMessage(messages.no)}];
    }

    render()
    {
        let {card} = this.props;
        let {childrenMetric, childrenMetricValue} = card; //eslint-disable-line
        const {formatMessage} = this.props.intl;
        return (
            <table className="ui celled compact structured table" >
                <thead>
                    <tr>
                        <th style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.tableTitle}/></th>
                        <th style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.tableValue}/></th>
                        <th style={{padding: '3px 3px 3px 3px'}}><FormattedMessage {...messages.tableHint}/></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><FormattedMessage {...messages.childrenCardMetricTypeLabel}/></td>
                        <td><ComboField fieldName="childrenMetric" label={''} style={{maxWidth: '200px'}} getSuggestionFunc={KanbanActions.boardSetting.metricType.search} selectedItem={childrenMetric} onSelectItem={this._handleSelectedItem} boardId={card.board} placeHolder={formatMessage(messages.sameFromCardPlaceHolder)}/></td>
                        <td><FormattedMessage {...messages.childrenCardMetricTypeHint}/></td>
                    </tr>
                    <tr>
                        <td><FormattedMessage {...messages.childrenCardMetricValueLabel}/></td>
                        <td>
                            <NumberInput
                                propName="childrenMetricValue"
                                value={card.childrenMetricValue}
                                placeHolder={formatMessage(messages.childrenCardMetricValueEmpty)}
                                change={this._handleChangeData}
                                required={false}
                                isDisabled={false}
                                normalStyle={{textAlign: 'left', margin: '2px', padding: '0px', cursor: 'pointer'}}
                                style={{border: '1px solid black', textAlign: 'left', width: '150px !important', margin: '2px', padding: '0px'}}
                                classLoading="isLoading"
                                classInvalid="k-inlineEdit invalid"
                            />
                        </td>
                        <td><FormattedMessage {...messages.childrenCardMetricValueHint}/></td>
                    </tr>
                    <tr>
                        <td><FormattedMessage {...messages.grandChildrenCardsBasedCalculationLabel}/></td>
                        <td>
                            <StaticComboField
                                initialValue={card.grandChildrenCardsBasedCalculation}
                                propName="grandChildrenCardsBasedCalculation"
                                showValueInLabelIfDistinct={false}
                                onChangeData={this._handleChangeData}
                                getSuggestions={this._getBooleanSuggestion}
                            />
                        </td>
                        <td><FormattedMessage {...messages.grandChildrenCardsBasedCalculationHint}/></td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

module.exports = injectIntl(ManageConnectionTab, {withRef: true});
