import React, {Component, PropTypes} from 'react';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header} from 'react-semantify';


import {Cards} from '../../../../../../components';
import {CardExecutionStatus} from '../../../../../../enums';
import {default as KCard} from '../../../../../board/show/KCard.jsx';

const messages = defineMessages(
{
    started: {id: 'modal.cardForm.connectionTab.connectedCardList.startedLabel', description: '', defaultMessage: 'Iniciados'},
    notStarted: {id: 'modal.cardForm.connectionTab.connectedCardList.notStartedLabel', description: '', defaultMessage: 'Não Iniciados'},
    finished: {id: 'modal.cardForm.connectionTab.connectedCardList.finishedLabel', description: '', defaultMessage: 'Finalizados'}
});

class CardListTab extends Component
{
    static displayName = 'CardListTab';

    static propTypes =
    {
        connectedCards: PropTypes.any.isRequired,
        statisticManager: PropTypes.object.isRequired,
        card: PropTypes.object.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
    }

    _getCards = (status) =>
    {
        let {statisticManager, card} = this.props;
        let cardStatistic = statisticManager.getStatistic(card);

        return cardStatistic[status].cards.map(function (connectedCard)
        {
            return (
                <KCard key={`${connectedCard._id}`} card={connectedCard} isReadOnly hostStyle={{display: 'table'}}/>
            );
        }, this);

    }

    render()
    {
        let notStartedCardsItemsToRender = this._getCards(CardExecutionStatus.notStarted.name);
        let startedCardsItemsToRender = this._getCards(CardExecutionStatus.started.name);
        let finishedCardsItemsToRender = this._getCards(CardExecutionStatus.finished.name);

        return (
            <div>
                <div>
                    <Header className="block" style={{padding: '2px', backgroundColor: 'lightgrey'}}><FormattedMessage {...messages.started} style={{marginLeft: '5px'}}/></Header>
                        <Cards className="five special" style={{marginBottom: '10px'}}>
                            {startedCardsItemsToRender}
                        </Cards>
                    </div>
                <div>
                    <Header className="block" style={{padding: '2px', backgroundColor: 'lightgrey'}}><FormattedMessage {...messages.notStarted} style={{marginLeft: '5px'}}/></Header>
                    <Cards className="five special" style={{marginBottom: '10px'}}>
                        {notStartedCardsItemsToRender}
                    </Cards>
                </div>
                <div>
                    <Header className="block" style={{padding: '2px', backgroundColor: 'lightgrey'}}><FormattedMessage {...messages.finished} style={{marginLeft: '5px'}}/></Header>
                    <Cards className="five special" style={{marginBottom: '10px'}}>
                        {finishedCardsItemsToRender}
                    </Cards>
                </div>
            </div>
        );
    }
}

module.exports = injectIntl(CardListTab, {withRef: true});

