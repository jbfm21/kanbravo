//TODO: Intercionalizar
import React, {Component, PropTypes} from 'react';
import {Grid, Column} from 'react-semantify';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import {ImmutableState} from '../../../../decorators';
import {FaIcon, Button, Rating, Avatar} from '../../../../components';
import {FunctionHelper} from '../../../../commons';


const messages = defineMessages(
{
    delete: {id: 'modal.cardForm.ratingTab.delete.label', description: 'Delete button label', defaultMessage: 'Excluir'},
    clear: {id: 'modal.cardForm.ratingTab.clear.label', description: 'Delete button label', defaultMessage: 'Limpar'}
});

@ImmutableState
class RatingItem extends Component
{
    static displayName = 'RatingItem';

    static propTypes =
    {
        rating: PropTypes.object.isRequired,
        onDelete: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        onClear: PropTypes.func.isRequired,
        index: PropTypes.number.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
    }

    render()
    {
        let {rating, onDelete, onChange, onClear} = this.props;
        if (FunctionHelper.isUndefined(rating.ratingType))
        {
            //Para proteger o código caso o join entre rating e rating type nao seja feito corretamente
            return null;
        }
        return (
            <li style={{height: '40px', lineHeight: 2.5}}>
                <Grid style={{width: '100%'}} >
                    <Column className="two wide ratingLabel">{rating.ratingType.title}</Column>
                    <Column className="ten wide ratingLabel">
                        <Rating onChange={onChange} iconContainerClassName={'k-rating-with-opacity'}
                            empty={<Avatar avatar={rating.ratingType.avatar} style={{width: '24px', height: '24px', lineHeight: 2, marginTop: '10px', marginLeft: '5px'}} className="k-half-opacity icon-color"/>}
                            full={<Avatar avatar={rating.ratingType.avatar} style={{width: '24px', height: '24px', lineHeight: 2, marginTop: '10px', marginLeft: '5px'}} className="k-full-opacity icon-color"/>} initialRate={rating.votes} start={0} stop={rating.ratingType.maxRating}
                        />
                    </Column>
                    <Column style={{width: '20%', display: 'flex'}}>
                        <Button onClick={onClear} className="tiny cancel">
                            <FormattedMessage {...messages.clear} />
                        </Button>
                        <Button onClick={onDelete} className="tiny negative" style={{marginLeft: '5px'}}>
                            <FaIcon className="fa-trash fa-1x"/>
                            <FormattedMessage {...messages.delete} />
                        </Button>
                    </Column>
                </Grid>
            </li>
        );
    }
}

module.exports = injectIntl(RatingItem);
