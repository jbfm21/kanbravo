'use strict';

import React from 'react';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import {Float} from '../../../../components';
import {FunctionHelper} from '../../../../commons';


const messages = defineMessages(
{
    showMore: {id: 'modal.comments.showMore', description: 'Show more comments', defaultMessage: 'Exibir {limit} comentários anteriores'},
    numberOfComments: {id: 'modal.comments.numberOfComments', description: 'Total of comments', defaultMessage: '{totalOfFetchedComments}/{totalOfCommentsInDb} comentários'},
    showAll: {id: 'modal.comments.showAll', description: 'Show all comments', defaultMessage: 'Exibir todos os comentários anteriores'}
});

class CommentNavigator extends React.Component
{
    static displayName = 'CommentNavigator';

    static propTypes =
    {
        onRequestMoreOldComments: React.PropTypes.func.isRequired,
        onRequestShowAll: React.PropTypes.func.isRequired,
        cursorBeforeValue: React.PropTypes.string,
        limit: React.PropTypes.number.isRequired,
        totalOfFetchedComments: React.PropTypes.number.isRequired,
        totalOfCommentsInDb: React.PropTypes.number.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
    }

    _handleOnShowAll = (e) =>
    {
        e.preventDefault();
        //TODO: corrigir aqui para pegar o numero total de exibidos até o momento
        this.props.onRequestShowAll();
    };

    _handleOnShowMore = (e) =>
    {
        e.preventDefault();
        this.props.onRequestMoreOldComments(this.props.cursorBeforeValue, this.props.limit);
    }

    render()
	{
        const {cursorBeforeValue, limit, totalOfFetchedComments, totalOfCommentsInDb} = this.props;
        const isLastPage = !FunctionHelper.isDefined(cursorBeforeValue) || totalOfCommentsInDb === totalOfFetchedComments;
        return (
            <div style={{marginBottom: '5px', marginLeft: '10px', display: 'inline-flex', height: '5%', width: '100%'}}>
                {
                    isLastPage && <div style={{display: 'inline-flex', color: '#365899', fontWeight: 'bold', fontSize: '10px', width: '80%'}}/>
                }
                {
                    !isLastPage &&
                        <div style={{display: 'inline-flex', color: '#365899', fontWeight: 'bold', fontSize: '10px', width: '80%'}}>
                            <div onClick={this._handleOnShowMore}><span style={{cursor: 'pointer'}}><FormattedMessage {...messages.showMore} values={{limit: limit}}/></span></div>
                            <div onClick={this._handleOnShowAll}><span style={{cursor: 'pointer', marginLeft: '10px'}}><FormattedMessage {...messages.showAll}/></span></div>
                        </div>
                }
                <Float className="right" style={{color: '#90949c', fontSize: '10px'}}><FormattedMessage {...messages.numberOfComments} values={{totalOfFetchedComments: totalOfFetchedComments, totalOfCommentsInDb: totalOfCommentsInDb}}/></Float>
            </div>

        );
    }
}
module.exports = injectIntl(CommentNavigator);
