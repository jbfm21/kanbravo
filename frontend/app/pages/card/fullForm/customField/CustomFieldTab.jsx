import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import _ from 'lodash';
import {Header, Segment, Icon} from 'react-semantify';
import Loader from 'react-loader';


import {FunctionHelper} from '../../../../commons';
import {ImmutableState} from '../../../../decorators';
import {KanbanActions} from '../../../../actions';
import {FaIcon, Description, Content, FormToast, Container} from '../../../../components';
import {default as CustomFieldItem} from './CustomFieldItem.jsx';
import {BoardContextStore} from '../../../../stores';

import {default as CustomFieldStore} from './CustomFieldStore';

//TODO: implementar shouldUpdate e intercionalizar

const messages = defineMessages(
{
    customFieldListTitle: {id: 'modal.cardForm.customFieldTab.customFieldListTitle', description: '', defaultMessage: 'Campos customizados'},
    emptyCustomFieldConfig: {id: 'modal.cardForm.customFieldTab.emptyCustomFieldConfig', description: '', defaultMessage: 'Olá, você precisa primeiro cadastrar os tipos de campos customizados que deseja utilizar no quadro. Para tal utilize a opção Configurações -> Campos customizados.'}
});

var StateRecord = Immutable.Record({cardCustomFields: {fields: []}, isLoading: false, actionMessage: null});

@ImmutableState
@airflux.FluxComponent
class CustomFieldTab extends Component
{
    static displayName = 'CustomFieldTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
       this.listenTo(CustomFieldStore, this._listenToCustomFieldStore);
       this.state = {data: new StateRecord()};
    }

    _listenToCustomFieldStore = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.cardCustomField.list.progressed:
            case KanbanActions.cardSetting.cardCustomField.upinsert.progressed:
                this.setImmutableState({isLoading: true, actionMessage: ''});
                break;

            case KanbanActions.cardSetting.cardCustomField.list.failed:
            case KanbanActions.cardSetting.cardCustomField.upinsert.failed:
                this.setImmutableState({isLoading: false, actionMessage: store.actionMessage});
                break;

            case KanbanActions.cardSetting.cardCustomField.list.completed:
                this.setImmutableState({isLoading: false, cardCustomFields: store.state.cardCustomFields});
                break;

            case KanbanActions.cardSetting.cardCustomField.upinsert.completed:
            {
                let {customFieldItem} = store.state;
                let {cardCustomFields} = this.state.data;
                let match = _.find(cardCustomFields.fields, (item) =>
                {
                    return FunctionHelper.getId(item.type) === FunctionHelper.getId(customFieldItem.type);
                });
                if (!match)
                {
                    const isFirtInsert = FunctionHelper.isUndefined(cardCustomFields.fields);
                    if (isFirtInsert)
                    {
                        cardCustomFields.fields = [];
                    }
                    if (cardCustomFields && FunctionHelper.isDefined(cardCustomFields.fields))
                    {
                        cardCustomFields.fields.unshift(customFieldItem);
                    }
                }
                else
                {
                    _.merge(match, customFieldItem);
                }
                this.setImmutableState({cardCustomFields: cardCustomFields, isLoading: false});
                this.forceUpdate();
                break;
            }

           default: break;
        }
    }

    _handleSaveCustomField = (customField) =>
    {
        const {card} = this.props;
        KanbanActions.cardSetting.cardCustomField.upinsert.asFunction(card, customField);
    }

    render()
    {
        const {cardCustomFields, isLoading, actionMessage} = this.state.data;
        const {card} = this.props;
        const customFieldConfigs = BoardContextStore.getState().selectedBoardAllConfig.customFieldConfigs;
        if (FunctionHelper.isArrayNullOrEmpty(customFieldConfigs))
        {
            return (<Container className="ui center aligned informationMessage black">
                <Icon className="massive configure"/>
                <Header><FormattedMessage {...messages.customFieldListTitle}/></Header>
                <Description style={{fontSize: '24px'}}>
                    <FormattedMessage {...messages.emptyCustomFieldConfig}/>
                </Description>
            </Container>
            );
        }
        let customFieldItems = customFieldConfigs.map(function (customFieldConfig, i)
        {
            let customField = _.find(cardCustomFields.fields, (item) =>
            {
                return FunctionHelper.getId(item.type) === customFieldConfig._id;
            });
            customField = FunctionHelper.isDefined(customField) ? customField : {board: card._id, card: card._id, type: customFieldConfig._id, value: null, nonce: ''};
            //TODO: melhorar para nao usar o FunctionHelper.uuid. Utilizei aqui para forcar a atualização da interface
            return (
                <CustomFieldItem key={`${customFieldConfig._id}_${customField.nonce}`}
                    card={this.props.card}
                    customFieldConfig={customFieldConfig}
                    isLoading={isLoading}
                    customField={customField}
                    index={i}
                    onSave={this._handleSaveCustomField.bind(this)}/>
            );
        }, this);

        return (
            <div style={{marginTop: '10px'}}>
                <Loader loaded={!isLoading} />
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                <Segment className="blue">
                    <Header>
                        <FaIcon className="fa-list-alt" style={{marginRight: 10 + 'px'}}/>
                        <Content>
                            <FormattedMessage {...messages.customFieldListTitle}/>
                        </Content>
                    </Header>
                    <Content className="k-edit-setting k-text withScrollBar" style={{minHeight: '500px', maxHeight: '500px'}}>
                        {customFieldItems}
                    </Content>
                </Segment>
            </div>
        );
    }
}

module.exports = injectIntl(CustomFieldTab, {withRef: true});
