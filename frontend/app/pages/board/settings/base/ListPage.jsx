import React from 'react';
import * as airflux from 'airflux';
import Immutable from 'immutable';
import {intlShape, defineMessages, FormattedMessage} from 'react-intl';
import {Header, Segment} from 'react-semantify';
import Loader from 'react-loader';
import _ from 'lodash';

import {NavLink, Container, Content, Meta, FaIcon, SearchBox} from '../../../../components';
import {FunctionHelper} from '../../../../commons';
import {ImmutableShouldUpdateComponent, ImmutableState} from '../../../../decorators';
import {UIActions} from '../../../../actions';

const messages = defineMessages(
{
    hasOneItemSelected: {id: 'listItem.hasOneItemSelected', description: 'Has One intem in Edit State Already', defaultMessage: 'Só é possível alterar/remover um item por vez.'},
    searchPlaceHolder: {id: 'listItem.search', description: 'Search item', defaultMessage: 'Pesquisar...'}
});

var StateRecord = Immutable.Record({isLoading: false, entities: null, selectedItem: null, filterQueryValue: null});

@airflux.FluxComponent
@ImmutableShouldUpdateComponent
@ImmutableState
class ListPage extends React.Component
{
    static displayName = 'ListPage';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    static titleFilterFunction(entities, query)
    {
        if (FunctionHelper.isUndefined(query))
        {
            return entities;
        }
        return _.filter(entities, (item) => _.includes(item.title.toLowerCase(), query.toLowerCase()));
    }

    static noSort = null;

    constructor(props, pageName, store, customMessages, itemTemplate, filterFunction, sortFunction)
    {
        super(props);
        this.pageName = pageName;
        this.store = store;
        this.customMessages = customMessages;
        this.listenTo(store, this._listenToStoreChange);
        this.state = {data: new StateRecord()};
        this.ItemTemplate = itemTemplate;
        this.filterFunction = filterFunction;
        this.sortFunction = sortFunction;
    }

    componentWillMount()
	{
        if (!this.state.entities)
		{
            //TODO: quando entra diretamente na pagina a lista é chamada duas vezes
            this.setImmutableState({isLoading: true, entities: null, selectedItem: null});
			this.store.getActions().list.asFunction(this.props.params.boardId);
        }
    }

    componentWillReceiveProps(nextProps)
    {
        if (!this.state.data.isLoading)
        {
            this.setImmutableState({isLoading: true, entities: null, selectedItem: null});
            this.store.getActions().list.asFunction(nextProps.params.boardId);
        }
    }

    componentWillUnmount()
	{
		this.ignoreLastFetch = true;
        this.setImmutableState({isLoading: false, entities: null, selectedItem: null});
	}

    _listenToStoreChange(store)
	{
        switch (store.actionState)
        {
            case this.store.getActions().list.progressed:
            case this.store.getActions().add.progressed:
            case this.store.getActions().update.progressed:
            case this.store.getActions().delete.progressed:
                this.setImmutableState({isLoading: true});
                break;

            case this.store.getActions().list.completed:
                this.setImmutableState({isLoading: false, entities: store.state.entities, selectedItem: null});
                break;
            case this.store.getActions().list.failed:
                this.setImmutableState({isLoading: false});
                break;

            case this.store.getActions().add.completed:
                this.itemToAdd.getWrappedInstance().resetForm();
                this.setImmutableState({isLoading: false});
                break;
            case this.store.getActions().add.failed:
                this.setImmutableState({isLoading: false});
                break;

            case this.store.getActions().update.completed:
                if (FunctionHelper.isDefined(this.state.data.selectedItem))
                {
                    this.state.data.selectedItem.editCompleted();
                }
                this.setImmutableState({isLoading: false});
                break;
            case this.store.getActions().update.failed:
                 if (FunctionHelper.isDefined(this.state.data.selectedItem))
                 {
                        this.state.data.selectedItem.enableFormForEdit();
                 }
                 this.setImmutableState({isLoading: false});
                break;

            case this.store.getActions().delete.completed:
            case this.store.getActions().delete.failed:
                this.setImmutableState({isLoading: false});
                break;
           default: break;
        }
    }

    _handleSelectItem = (itemToBeEdit) =>
    {
        if (FunctionHelper.isDefined(this.state.data.selectedItem))
        {
            UIActions.showClientErrorMessage.asFunction(messages.hasOneItemSelected);
            return false;
        }
        this.setImmutableState({selectedItem: itemToBeEdit});
        return true;
    };

    _handleDeselectItem = () =>
    {
        this.setImmutableState({selectedItem: null});
    };

    _handleAddSubmit = (item) => //eslint-disable-line no-unused-vars
    {
        const boardId = this.props.params.boardId;
        const dataToSubmit = item.getDataToSubmit();
        this.store.getActions().add.asFunction(boardId, dataToSubmit);
    };

    _handleEditSubmit = (item) => //eslint-disable-line no-unused-vars
    {
        const dataToSubmit = item.getDataToSubmit();
        this.store.getActions().update.asFunction(dataToSubmit);
    };

    _handleDeleteSubmit = (item) => //eslint-disable-line no-unused-vars
    {
        this.store.getActions().delete.asFunction(item.props.entity);
    };

    _handleDoSearch = (query) =>
    {
        this.setImmutableState({filterQueryValue: query});
    }

    render()
    {
        const that = this;
        const {formatMessage} = this.props.intl;
        const iconHeaderStyle = {marginRight: 10 + 'px'};
        const boardId = this.props.params.boardId;
        const {entities, isLoading} = this.state.data;
        const ItemTemplate = this.ItemTemplate;
        let entityNodes = null;
        if (!FunctionHelper.isArrayNullOrEmpty(entities))
        {
            //TODO: melhorar usando lodash???
            const filterEntities = (FunctionHelper.isDefined(this.filterFunction) && FunctionHelper.isNotNullOrEmpty(this.state.data.filterQueryValue)) ? this.filterFunction(entities, this.state.data.filterQueryValue) : entities;
            const sortedEntities = (FunctionHelper.isDefined(this.sortFunction)) ? this.sortFunction(entities) : filterEntities;
            entityNodes = sortedEntities.map(function(entity)
            {
                return (<ItemTemplate boardId={boardId} templateMode="EditDeleteTemplate" key={`itup_${entity._id}`} entity={entity} onSelectItem={that._handleSelectItem} onDeselectItem={that._handleDeselectItem} onDeleteSubmit={that._handleDeleteSubmit} onEditSubmit={that._handleEditSubmit}/>);
            });
        }
        return (
            <Container className={`setting segments ${this.pageName}`}>
                <Loader loaded={!isLoading} />
                <Segment>
                    <Header><FormattedMessage {...this.customMessages.title} /></Header>
                    <Meta>
                        <FormattedMessage {...this.customMessages.subtitle} />
                        {
                            this.customMessages.documentation && <NavLink to={`/boards/${boardId}/settings/${this.customMessages.documentation.url}`}><FormattedMessage {...this.customMessages.documentation} /></NavLink>
                        }
                        <div style={{marginTop: '10px', fontWeight: 'bold', whiteSpace: 'pre'}}>
                        {
                            this.customMessages.attention && <FormattedMessage {...this.customMessages.attention} />
                        }
                        </div>
                    </Meta>

                </Segment>
                <Segment className="red">
                    <Header>
                        <FaIcon className="fa-plus" style={iconHeaderStyle}/><Content><FormattedMessage {...this.customMessages.addFormTitle} /></Content>
                    </Header>
                    <Content className="k-new-setting">
                        <ItemTemplate boardId={boardId} templateMode="InsertTemplate" key="itemToAdd" onAddSubmit={this._handleAddSubmit} isSubmitting={isLoading} ref={c => {that.itemToAdd = c; return;}}/>
                    </Content>
                </Segment>
                <Segment className="blue">
                    <Header>
                        <FaIcon className="fa-list-alt" style={iconHeaderStyle}/><Content><FormattedMessage {...this.customMessages.listTitle} /></Content>
                        {this.filterFunction && <SearchBox placeHolder={formatMessage(messages.searchPlaceHolder)} onSearch={this._handleDoSearch} style={{display: 'flex'}}/>}
                    </Header>
                    <Content className="k-edit-setting k-text withScrollBar">
                        {entityNodes}
                    </Content>
                </Segment>
            </Container>
        );
    }
}

module.exports = ListPage;
