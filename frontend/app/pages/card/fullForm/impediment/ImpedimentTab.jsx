import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import _ from 'lodash';
import {Grid, Column, Header, Segment} from 'react-semantify';
import moment from 'moment';
import Loader from 'react-loader';

import {ImmutableState} from '../../../../decorators';
import {KanbanActions} from '../../../../actions';
import {FaIcon, Button, Content, FormToast, TextInput} from '../../../../components';
import {FunctionHelper} from '../../../../commons';
import {default as ImpedimentItem} from './ImpedimentItem.jsx';

import {default as ImpedimentStore} from './ImpedimentStore';
import {default as ComboField} from '../components/ComboField.jsx';

//TODO: implementar shouldUpdate e intercionalizar

const messages = defineMessages(
{
    newImpedimentReasonPlaceHolder: {id: 'modal.cardForm.impedimentTab.newImpedimentReason.placeHolder', description: 'New Impediment Reason TextArea PlaceHolder', defaultMessage: 'Motivo do impedimento!'},
    addButton: {id: 'modal.cardForm.impedimentTab.addButtom', description: 'Add new impediment button', defaultMessage: 'Criar'},
    addNewImpedimentTitle: {id: 'modal.cardForm.impedimentTab.addNewImpedimentTitle', description: '', defaultMessage: 'Cadastre um novo Impedimento:'},
    selectPlaceHolder: {id: 'modal.cardForm.selectPlaceHolder', description: '', defaultMessage: 'Selecionar'},
    impedimentListTitle: {id: 'modal.cardForm.impedimentTab.impedimentListTitle', description: '', defaultMessage: 'Impedimentos cadastrados'},
    impedimentType: {id: 'modal.cardForm.impedimentTab.impedimentType', description: '', defaultMessage: 'Tipo'},
    impedimentReason: {id: 'modal.cardForm.impedimentTab.impedimentReason', description: '', defaultMessage: 'Motivo'},
    impedimentStartDate: {id: 'modal.cardForm.impedimentTab.impedimentStartDate', description: '', defaultMessage: 'Início'},
    impedimentEndDate: {id: 'modal.cardForm.impedimentTab.impedimentStartDate', description: '', defaultMessage: 'Fim'},
    impedimentDuration: {id: 'modal.cardForm.impedimentTab.impedimentDuration', description: '', defaultMessage: 'Duração'},
    selectImpedimentType: {id: 'modal.cardForm.impedimentTab.selectImpedimentType', description: '', defaultMessage: 'Para incluir um impedimento é necessário selecionar um tipo de impedimento.'},
    saveImpedimentTip: {id: 'modal.cardForm.impedimentTab.saveImpedimentTip', description: '', defaultMessage: '(atalho: cntrl+enter para incluir tarefa )'}
});

var StateRecord = Immutable.Record({newImpedimentType: null, isLoading: false, actionMessage: null, impediments: []});

@ImmutableState
@airflux.FluxComponent
class ImpedimentTab extends Component
{
    static displayName = 'ImpedimentTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(ImpedimentStore, this._listenToImpedimentStore);
       this.state = {data: new StateRecord()};
    }

    _listenToImpedimentStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.impediment.list.progressed:
            case KanbanActions.cardSetting.impediment.add.progressed:
            case KanbanActions.cardSetting.impediment.update.progressed:
            case KanbanActions.cardSetting.impediment.delete.progressed:
                this.setImmutableState({isLoading: true, actionMessage: ''});
                break;

            case KanbanActions.cardSetting.impediment.list.failed:
            case KanbanActions.cardSetting.impediment.add.failed:
            case KanbanActions.cardSetting.impediment.update.failed:
            case KanbanActions.cardSetting.impediment.delete.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;


            case KanbanActions.cardSetting.impediment.list.completed:
                this.setImmutableState({isLoading: false, impediments: store.state.impediments});
                break;

            case KanbanActions.cardSetting.impediment.add.completed:
            {
                let {impedimentItem} = store.state;
                let {impediments} = this.state.data;
                let match = _.find(impediments, {_id: impedimentItem._id});
                if (!match)
                {
                    impediments.unshift(impedimentItem);
                }
                this.setImmutableState({isLoading: false, impediments: impediments});
                this.impedimentDescriptionTextArea.setValue('');
                this.impedimentDescriptionTextArea.focus();
                break;
            }

            case KanbanActions.cardSetting.impediment.update.completed:
            {
                let {impedimentItem} = store.state;
                let {impediments} = this.state.data;
                let match = _.find(impediments, {_id: impedimentItem._id});
                if (match)
                {
                    _.merge(match, impedimentItem);

                }
                this.setImmutableState({isLoading: false, impediments: impediments});
                break;
            }

            case KanbanActions.cardSetting.impediment.delete.completed:
            {
                let {impedimentItemId} = store.state;
                let {impediments} = this.state.data;
                _.remove(impediments, {_id: impedimentItemId});
                this.setImmutableState({isLoading: false, impediments: impediments});
                break;
            }

           default: break;
        }
    }

   _handleAddImpediment = (e) =>
    {
        e.preventDefault();
        const {card} = this.props;
        const {formatMessage} = this.props.intl;
        const {newImpedimentType} = this.state.data;
        const newImpedimentReason = this.impedimentDescriptionTextArea.getValue().trim();
        if (!newImpedimentType)
        {
            this.setImmutableState({actionMessage: formatMessage(messages.selectImpedimentType)});
            return;
		}
        const impediment = {board: card.board, card: card._id, type: newImpedimentType, reason: newImpedimentReason.trim(), startDate: moment().utc().toDate()};
        KanbanActions.cardSetting.impediment.add.asFunction(card, impediment);

    }

    _handleSelectedImpedimentTypeItem = (fieldName, selectedItem) =>
    {
        this.setImmutableState({newImpedimentType: selectedItem});
        this.forceUpdate();
    }

    _handleDelete = (impediment, e) => //eslint-disable-line
    {
        e.preventDefault();
        KanbanActions.cardSetting.impediment.delete.asFunction(impediment);
	}

    _handleSave = (impedimentToSave) => //eslint-disable-line
    {
        KanbanActions.cardSetting.impediment.update.asFunction(impedimentToSave);
	}

    render()
    {
        const {card} = this.props;
        const {impediments, newImpedimentType, isLoading, actionMessage} = this.state.data;
        const {formatMessage} = this.props.intl;
        const newImpedimentReasonPlaceHolder = formatMessage(messages.newImpedimentReasonPlaceHolder);
        let impedimentItems = impediments.map(function (impediment, i)
        {
            return (<ImpedimentItem key={`${impediment._id}_${impediment.nonce}`} impediment={impediment} index={i} onDelete={this._handleDelete.bind(this, impediment)} onSave={this._handleSave.bind(this)}/>);
        }, this);
        return (
            <div style={{marginTop: '10px'}}>
                <Loader loaded={!isLoading} />
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                <Segment className="red">
                    <Content className="k-new-setting">
                        <div style={{display: 'inline-flex'}}>
                            <ComboField fieldName="type" label={formatMessage(messages.addNewImpedimentTitle)} getSuggestionFunc={KanbanActions.boardSetting.impedimentType.search} selectedItem={newImpedimentType} onSelectItem={this._handleSelectedImpedimentTypeItem} boardId={card.board} placeHolder={formatMessage(messages.selectPlaceHolder)}/>
                            <Button onClick={this._handleAddImpediment} className="tiny positive" style={{marginLeft: '10px', position: 'relative', top: '23px', height: '30px'}}><FaIcon className="fa-plus fa-1x"/><FormattedMessage {...messages.addButton} /></Button>
                        </div>
                        <TextInput
                            ref={(ref) => {this.impedimentDescriptionTextArea = ref; return;}}
                            style={{minHeight: '60px', height: '60px', maxHeight: '120px'}}
                            maxLength="1000"
                            submitKeyFunction={FunctionHelper.isCntrlEnterKeyPressed}
                            placeholder={newImpedimentReasonPlaceHolder}
                            onChangeData={this._handleAddImpediment}
                            autoFocus={true}/>


                        <div style={{fontSize: '10px', color: 'gray'}}><FormattedMessage {...messages.saveImpedimentTip}/></div>
                    </Content>
                </Segment>
                <Segment className="blue">
                    <Header>
                        <FaIcon className="fa-list-alt" style={{marginRight: 10 + 'px'}}/><Content><FormattedMessage {...messages.impedimentListTitle} /> </Content>
                    </Header>
                    <Content className="k-edit-setting k-text withScrollBar">
                        <ul className="k-card-list-edit">
                            <li className={'listHeader'}>
                                <Grid style={{width: '100%'}}>
                                    <Column className="one wide "><FormattedMessage {...messages.impedimentType} /> </Column>
                                    <Column className="four wide "><FormattedMessage {...messages.impedimentReason} /></Column>
                                    <Column className="three wide " style={{textAlign: 'center', margin: '0px', padding: '0px'}}><FormattedMessage {...messages.impedimentStartDate} /></Column>
                                    <Column className="three wide " style={{textAlign: 'center', margin: '0px', padding: '0px'}}><FormattedMessage {...messages.impedimentEndDate} /></Column>
                                    <Column className="two wide " style={{textAlign: 'center', margin: '0px', padding: '0px'}}><FormattedMessage {...messages.impedimentDuration} /></Column>
                                </Grid>
                            </li>
                            {impedimentItems}
                        </ul>
                    </Content>
                </Segment>
            </div>
        );
    }
}

module.exports = injectIntl(ImpedimentTab, {withRef: true});

