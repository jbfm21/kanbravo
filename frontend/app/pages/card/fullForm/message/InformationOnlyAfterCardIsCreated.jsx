import React, {Component} from 'react';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header} from 'react-semantify';
import {Container, FaIcon} from '../../../../components';

const messages = defineMessages(
{
    informationOnlyAfterCardIsCreated: {id: 'modal.cardForm.dateMetricTab.informationOnlyAfterCardIsCreated', description: 'DateMetric informationOnlyAfterCardIsCreated', defaultMessage: 'Informações disponíveis somente após a criação do cartão!'}
});

class InformationOnlyAfterCardIsCreated extends Component
{
    static displayName = 'InformationOnlyAfterCardIsCreated';
    static propTypes =
    {
        intl: intlShape.isRequired
    };

    render()
    {
        return (
            <div style={{display: 'inline-block', width: '100%'}}>
                <Container className="ui center aligned black informationMessage">
                    <FaIcon className="fa-area-chart fa-5x "/>
                    <Header><FormattedMessage {...messages.informationOnlyAfterCardIsCreated} /></Header>
                </Container>
            </div>
        );
    }
}

module.exports = injectIntl(InformationOnlyAfterCardIsCreated, {withRef: true});

