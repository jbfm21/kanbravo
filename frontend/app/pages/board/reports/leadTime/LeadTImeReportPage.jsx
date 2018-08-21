'use strict';

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';


import {Header} from 'react-semantify';
import {Container, FaIcon, Description} from '../../../../components';

const messages = defineMessages({
    underConstruction: {id: 'allocation.underConstruction', description: 'page under construction', defaultMessage: 'Em breve relatórios para você poder melhorar ainda mais seu processo de trabalho'},
    underConstructionSubTitle: {id: 'allocation.underConstruction', description: 'page under construction subtitle', defaultMessage: 'Enquanto isso, extraia as informações em [Configurações -> Exportar/importar] e crie você mesmo seus relatórios'}
});

export default class LeadTimeReportPage extends React.Component
{
    static displayName = 'LeadTimeReportPage';

    render()
    {
        return (
            <Container className="ui center aligned informationMessage" style={{minHeight: '400px'}}>
                <FaIcon className="fa-bar-chart fa-5x "/>
                <Header><FormattedMessage {...messages.underConstruction} /></Header>
                <Description style={{color: 'white', fontSize: '20px'}}><FormattedMessage {...messages.underConstructionSubTitle} /></Description>
            </Container>
        );
    }
}

