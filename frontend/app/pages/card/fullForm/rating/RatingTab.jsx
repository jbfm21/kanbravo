import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import Immutable from 'immutable';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Grid, Column, Icon, Header, Segment} from 'react-semantify';
import {ImmutableState} from '../../../../decorators';
import {FunctionHelper} from '../../../../commons';
import {Button, FaIcon, Content, FormToast} from '../../../../components';
import {KanbanActions} from '../../../../actions';
import {BoardContextStore} from '../../../../stores';

import {default as ComboField} from '../components/ComboField.jsx';
import {default as RatingItem} from './RatingItem.jsx';

//TODO: implementar shouldUpdate

var StateRecord = Immutable.Record({ratings: [], selectedRatingTypeToAdd: null, actionMessage: ''});

const messages = defineMessages(
{
    newRatingTypeLabel: {id: 'modal.cardForm.ratingTab.newRatingType.label', description: 'New Rating Type Label', defaultMessage: 'Cadastre uma nova classificação: '},
    ratingList: {id: 'modal.cardForm.ratingTab.ratingList.label', description: 'Rating List Label', defaultMessage: 'Classificações cadastradas'},
    selectRatingType: {id: 'modal.cardForm.ratingTab.selectRatingType.label', description: 'selectRatingType', defaultMessage: 'Para incluir uma classificação é necessário selecionar um tipo de classificação.'},
    votes: {id: 'modal.cardForm.ratingTab.votes.label', description: 'votes', defaultMessage: 'Pontuação'},
    rating: {id: 'modal.cardForm.ratingTab.rating.label', description: 'votes', defaultMessage: 'Classificação'},
    addAllRatings: {id: 'modal.cardForm.ratingTab.addAllRating.label', description: 'votes', defaultMessage: 'Adicionar todos'}
});


@ImmutableState
class RatingTab extends Component
{
    static displayName = 'RatingTab';

    static propTypes =
    {
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super();
        this.state = (FunctionHelper.isDefined(props.card.ratings)) ? {data: new StateRecord({ratings: props.card.ratings})} : {data: new StateRecord()};
    }

    componentWillReceiveProps(nextProps)
    {
        const ratings = (FunctionHelper.isDefined(nextProps.card.ratings)) ? nextProps.card.ratings : [];
        this.setImmutableState({ratings: ratings});
    }

    getRatings() //metodo chamado externamente
    {
        return this.state.data.ratings;
    }


    _handleSelectedRating = (fieldName, selectedItem) =>
    {
        this.setImmutableState({selectedRatingTypeToAdd: selectedItem, actionMessage: ''});
    }

    _handleAddAllRating = (event) =>
    {
        event.preventDefault();
        let {ratings} = this.state.data;
        const ratingTypes = BoardContextStore.getState().selectedBoardAllConfig.ratingTypes;
        if (FunctionHelper.isArrayNullOrEmpty(ratingTypes))
        {
            return;
        }

        _.forEach(ratingTypes, (ratingType) =>
        {
            let ratingTypeId = FunctionHelper.getId(ratingType);
            let match = _.find(ratings, function (o) { return FunctionHelper.getId(o.ratingType) === ratingTypeId;});
            if (!match)
            {
                const ratingToAdd = {id: FunctionHelper.uuid(), ratingType: ratingType, votes: 0};
                ratings = ratings.concat(ratingToAdd);
            }
        });
        this.setImmutableState({ratings: ratings});
    }

    _handleAddRating = (event) =>
    {
        event.preventDefault();
        const {ratings, selectedRatingTypeToAdd} = this.state.data;
        const {formatMessage} = this.props.intl;

        if (!selectedRatingTypeToAdd)
        {
            this.setImmutableState({actionMessage: formatMessage(messages.selectRatingType)});
            return;
		}

        const ratingToAdd = {id: FunctionHelper.uuid(), ratingType: selectedRatingTypeToAdd, votes: 0};
        const newRatingList = ratings.concat(ratingToAdd);
        this.setImmutableState({ratings: newRatingList});
	}

    _handleDelete = (rating) =>
    {
        const {ratings} = this.state.data;
        let newRatingList = ratings.filter(function (candidate)
        {
			return candidate !== rating;
		});
        this.setImmutableState({ratings: newRatingList});
	}

    _handleOnChangeRatingValue = (rating, rate) =>
    {
        rating.votes = rate;
	}

    _handleOnClearRatingValue = (rating, e) =>
    {
        e.preventDefault();
        rating.votes = 0;
        this.forceUpdate();
    }

    render()
    {
        let {ratings, selectedRatingTypeToAdd, actionMessage} = this.state.data;
        const {formatMessage} = this.props.intl;
        let newRatingTypeLabel = formatMessage(messages.newRatingTypeLabel);
        let ratingItems = ratings.map(function (rating, i)
        {
            return (<RatingItem key={rating.id} rating={rating} index={i} onChange={this._handleOnChangeRatingValue.bind(this, rating)} onClear={this._handleOnClearRatingValue.bind(this, rating)} onDelete={this._handleDelete.bind(this, rating)}/>);
        }, this);
        return (
            <div style={{marginTop: '10px'}}>
                <FormToast message={actionMessage} kind="negative" style={{fontSize: '10px'}} />
                <Segment className="red">
                    <Content className="k-new-setting">
                        <div style={{display: 'inline-flex'}}>
                            <ComboField fieldName="Classificacao" label={newRatingTypeLabel} style={{maxWidth: '200px'}} getSuggestionFunc={KanbanActions.boardSetting.ratingType.search} selectedItem={selectedRatingTypeToAdd} onSelectItem={this._handleSelectedRating} boardId={this.props.card.board} placeHolder={'Selecionar'} />
                            <Button className="positive icon" style={{marginTop: '23px', height: '30px', marginLeft: '10px'}} onClick={this._handleAddRating}><Icon className="add" /></Button>
                            <Button className="blue icon" style={{marginTop: '23px', height: '30px', marginLeft: '10px'}} onClick={this._handleAddAllRating}><FormattedMessage {...messages.addAllRatings}/></Button>
                        </div>
                    </Content>
                </Segment>
                <Segment className="blue">
                    <Header>
                        <FaIcon className="fa-list-alt" style={{marginRight: 10 + 'px'}}/><Content><FormattedMessage {...messages.ratingList}/></Content>
                    </Header>
                    <Content className="k-edit-setting k-text withScrollBar">
                        <ul className="k-card-list-edit">
                            <li className={'listHeader'}>
                                <Grid style={{width: '100%'}}>
                                    <Column className="two wide"><FormattedMessage {...messages.rating}/></Column>
                                    <Column className="ten wide"><FormattedMessage {...messages.votes}/></Column>
                                    <Column style={{width: '20%'}}></Column>
                                </Grid>
                            </li>
                            {ratingItems}
                        </ul>
                    </Content>
                </Segment>
            </div>
        );
    }
}

module.exports = injectIntl(RatingTab, {withRef: true});
