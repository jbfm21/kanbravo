
'use strict';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import {ImmutableState} from '../../../../decorators';
import {FunctionHelper} from '../../../../commons';
import {BaseToolTip} from '../../../../components';
import {KanbanActions} from '../../../../actions';
import {default as KCardStore} from '../KCardStore';
import {default as TaskItem} from './TaskItem.jsx';

const messages = defineMessages(
{
    dontHaveEntities: {id: 'tooltip.tasks.dontHaveEntities', description: '', defaultMessage: 'Esse cartão não possui tarefas'},
    loading: {id: 'tooltip.tasks.loading', description: '', defaultMessage: 'Aguarde. Carregando...'},
    title: {id: 'tooltip.tasks.title', description: '', defaultMessage: 'Tarefas'},
    alt: {id: 'tooltip.impediment.alt', description: '', defaultMessage: 'Clique para visualizar as tarefas do cartão'}
});

const TOOLTIP_GROUP = 'cardToolTip'; //serve para usar a mesma instância de tooltip

@ImmutableState
class TaskPopup extends BaseToolTip
{

    static displayName = 'TaskPopup';

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

    _handleSave = (taskToSave) =>
    {
        this.setLoading();
        KanbanActions.cardSetting.task.update.asFunction(taskToSave);
	}

    externalListenToStorageChange = (store) =>
    {
        if (this.state.data.cardId !== this.props.card._id)
        {
            return;
        }
        switch (store.actionState)
        {
            case KanbanActions.cardSetting.task.list.completed:
            {
                this.setEntities(store.state.tasks);
                this.forceUpdate();
                break;
            }
            case KanbanActions.cardSetting.task.list.failed:
            {
                this.setEntities(null);
                this.setActionMessage(store.actionMessage);
                if (this.tooltip)
                {
                    this.forceUpdate();
                    this.tooltip.forceReRender();
                }
                break;
            }
            case KanbanActions.cardSetting.task.update.completed:
            {
                let {taskItem} = store.state;
                const entities = this.state.data.entities;
                if (taskItem.card !== this.props.card._id && FunctionHelper.isDefined(entities))
                {
                    return;
                }
                FunctionHelper.mergeIfMatch(entities, taskItem, '_id');
                this.setEntities(entities);
                this.clearBaseState();
                break;
            }
            case KanbanActions.cardSetting.task.update.failed:
                this.setActionMessage(store.actionMessage);
                if (this.tooltip)
                {
                    this.forceUpdate();
                    this.tooltip.forceReRender();
                }
                break;
            default: break;
        }
    };

    externalOnShowToolTip = () =>
    {
        this.setBaseState({cardId: this.props.card._id, entities: null}); //os estados precisam ser configurados aqui por conta do contexto do tooltip, não posso colocar no listener, pois todos são avisados
        KanbanActions.cardSetting.task.list.asFunction(this.props.card);
    };

    externalOnHideToolTip = () =>
    {
    };

    externalRenderTooltipContent = () =>
    {
        let {entities} = this.state.data;
        let itemstoRender = entities.map(item =>
        {
            return (<TaskItem onSave={this._handleSave.bind(this)} key={`${item._id}_${item.nonce}`} data={item}/>);
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

module.exports = injectIntl(TaskPopup, {withRef: true});
