
'use strict';
import React from 'react';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import {ImmutableState} from '../../../../decorators';
import {BaseToolTip} from '../../../../components';
import {KanbanActions} from '../../../../actions';
import {default as KCardStore} from '../KCardStore';
import {default as CustomFieldItem} from './CustomFieldItem.jsx';

const messages = defineMessages(
{
    dontHaveEntities_label1: {id: 'tooltip.customField.dontHaveEntities.label1', description: '', defaultMessage: 'Esse cartão não possui campos customizados.'},
    dontHaveEntities_label2: {id: 'tooltip.customField.dontHaveEntities.label2', description: '', defaultMessage: ' Para adicionar novos campos: '},
    dontHaveEntities_label3: {id: 'tooltip.customField.dontHaveEntities.label3', description: '', defaultMessage: 'Crie os tipos de campos customizados nas opções de configurações do quadro'},
    dontHaveEntities_label4: {id: 'tooltip.customField.dontHaveEntities.label4', description: '', defaultMessage: 'Altere as informações de campos customizados do cartão.'},
    loading: {id: 'tooltip.customField.loading', description: '', defaultMessage: 'Aguarde. Carregando...'},
    title: {id: 'tooltip.customField.title', description: '', defaultMessage: 'Campos customizados'},
    alt: {id: 'tooltip.customField.alt', description: '', defaultMessage: 'Clique para visualizar os campos customizados do cartão'}
});

const TOOLTIP_GROUP = 'cardToolTip'; //serve para usar a mesma instância de tooltip

@ImmutableState
class CustomFieldPopup extends BaseToolTip
{
    static displayName = 'CustomFieldPopup';

    static propTypes =
    {
        card: React.PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        let stateToExtend = {cardId: null};
        super(props, messages, KCardStore, TOOLTIP_GROUP, stateToExtend);
    }

    //@abstract method
    externalListenToStorageChange = (store) =>
    {
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.cardCustomField.listToShowInCard.completed:
            {
                if (this.state.data.cardId !== this.props.card._id)
                {
                    return;
                }
                const entities = store.state.customFields;
                this.setImmutableState({entities: entities});
                this.clearBaseState();
                this.forceUpdate();
                break;
            }
            case KanbanActions.cardSetting.cardCustomField.listToShowInCard.failed:
            {
                if (this.state.data.cardId !== this.props.card._id)
                {
                    return;
                }
                this.setImmutableState({entities: null});
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

    //@abstract method
    externalOnShowToolTip = () =>
    {
        this.setImmutableState({cardId: this.props.card._id}); //os estados precisam ser configurados aqui por conta do contexto do tooltip, não posso colocar no listener, pois todos são avisados
        KanbanActions.cardSetting.cardCustomField.listToShowInCard.asFunction(this.props.card);
    };

    //@abstract method
    externalOnHideToolTip = () =>
    {
    };

    //@abstract method
    externalRenderEmptyMessage = () =>
    {
        return (
            <div style={{whiteSpace: 'pre'}}>
                <FormattedMessage {...messages.dontHaveEntities_label1}/><br/>
                <FormattedMessage {...messages.dontHaveEntities_label2}/> <br/>
                <ul>
                    <li><FormattedMessage {...messages.dontHaveEntities_label3}/></li>
                    <li><FormattedMessage {...messages.dontHaveEntities_label4}/></li>
                </ul>
            </div>
        );
    }

    //@abstract method
    externalRenderTooltipContent = () =>
    {
        let {entities} = this.state.data;
        let itemstoRender = entities.map(item =>
        {
            return (<CustomFieldItem key={`${item._id}_${item.nonce}`} data={item}/>);
        });
        return (
            <table className="ui celled compact structured table" >
                <tbody>
                    {itemstoRender}
                </tbody>
            </table>
        );
    }

    render()
    {
        return this.baseRender();
    }
}

module.exports = injectIntl(CustomFieldPopup, {withRef: true});
