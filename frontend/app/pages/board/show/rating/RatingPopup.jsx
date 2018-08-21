'use strict';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import {ImmutableState} from '../../../../decorators';
import {FunctionHelper} from '../../../../commons';
import {BaseToolTip, Rating, Avatar} from '../../../../components';
import {default as KCardStore} from '../KCardStore';

const messages = defineMessages(
{
    dontHaveEntities: {id: 'tooltip.rating.dontHaveEntities', description: '', defaultMessage: 'Esse cartão não possui classificações'},
    loading: {id: 'tooltip.rating.loading', description: '', defaultMessage: 'Aguarde. Carregando...'},
    title: {id: 'tooltip.rating.title', description: '', defaultMessage: 'Classificação'},
    alt: {id: 'tooltip.impediment.alt', description: '', defaultMessage: 'Clique para visualizar as classificações do cartão'}
});

const TOOLTIP_GROUP = 'cardToolTip'; //serve para usar a mesma instância de tooltip

@ImmutableState
class RatingPopup extends BaseToolTip
{

    static displayName = 'RatingPopup';

    static propTypes =
    {
        card: React.PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        let stateToExtend = {cardId: null, entities: null};
        super(props, messages, KCardStore, TOOLTIP_GROUP, stateToExtend);
    }

    externalOnShowToolTip = () =>
    {
        this.setBaseState({cardId: this.props.card._id, entities: this.props.card.ratings});
        this.clearBaseState();
    };

    externalRenderTooltipContent = () =>
    {
        let {entities} = this.state.data;
        return (
            entities.map((rating, index) =>
            {
                if (FunctionHelper.isUndefined(rating.ratingType))
                {
                    return null;
                }
                return (
                    <div key={`tooltip-card-start_${this.props.card._id}_${index}`}>{rating.ratingType.title}:
                        <Rating iconContainerClassName={'k-rating-with-opacity'}
                            empty={<Avatar avatar={rating.ratingType.avatar} style={{width: '24px', height: '24px', lineHeight: 2, marginTop: '10px', marginLeft: '5px'}} className="k-half-opacity icon-color"/>} full={<Avatar avatar={rating.ratingType.avatar} style={{width: '24px', height: '24px', lineHeight: 2, marginTop: '10px', marginLeft: '5px'}} className="k-full-opacity icon-color"/>}
                            initialRate={rating.votes} start={0} stop={rating.ratingType.maxRating} readonly>
                        </Rating>
                    </div>);
            })
        );
    }

    render()
    {
        return this.baseRender();
    }
}

module.exports = injectIntl(RatingPopup);
