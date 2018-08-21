//TODO: COlocar os botões de criar cartão e conectar ou conectar a algum já existente
import React, {Component} from 'react';
import * as airflux from 'airflux';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import {Header, Icon} from 'react-semantify';

import {ImmutableState} from '../../../../../decorators';
import {Description, Container} from '../../../../../components';

const messages = defineMessages(
{
    title: {id: 'modal.cardForm.connectionTab.emptyConnection.title', description: '', defaultMessage: 'Conexão'},
    helpText1: {id: 'modal.cardForm.connectionTab.emptyConnection.helpText', description: '', defaultMessage: 'Crie relacionamentos entre cartões no mesmo quadro ou em quadros diferentes.'}
});

@ImmutableState
@airflux.FluxComponent
class EmptyConnection extends Component
{
    static displayName = 'EmptyConnection';

    static propTypes =
    {
        intl: intlShape.isRequired
    };

    constructor(props)
    {
       super(props);
    }

    render()
    {
        return (
            <Container className="ui center aligned informationMessage black">
                <Icon className="massive plug"/>
                <Header><FormattedMessage {...messages.title}/></Header>
                <Description style={{fontSize: '24px'}}>
                    <FormattedMessage {...messages.helpText1}/>
                </Description>
            </Container>
        );
    }
}

module.exports = injectIntl(EmptyConnection, {withRef: true});

