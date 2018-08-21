import React from 'react';
import * as airflux from 'airflux';
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl';
import {Header, Segment} from 'react-semantify';

import {Container, Content, NavLink} from '../../../../components';

const messages = defineMessages(
{
    clearquest: {id: 'TrackerIntegrationSettingDoc.clearQuestTitle', description: '', defaultMessage: 'Integração clearquest'},
    generic: {id: 'TrackerIntegrationSettingDoc.genericTitle', description: '', defaultMessage: 'Integração genérica'}
});


@airflux.FluxComponent
class TrackerIntegrationSettingDoc extends React.Component
{
    static displayName = 'TrackerIntegrationSettingDoc';

    static propTypes =
    {
        intl: intlShape.isRequired,
        params: React.PropTypes.object
    };

    render()
    {
        const boardId = this.props.params.boardId;
        return (
            <Container className={`setting segments ${this.pageName}`}>
                <Segment className="red">
                    <Header>
                        <Content><NavLink to={`/boards/${boardId}/settings/trackerIntegrations`}>Voltar</NavLink></Content>
                    </Header>
                </Segment>
                <Segment className="red">
                    <Header>
                        <Content><FormattedMessage {...messages.clearquest} /></Content>
                    </Header>
                    <Content className="k-new-setting">
                        <div>Para integração com Clearquest, fornecer a url da api OSLC do Clearquest.</div>
                        <div style={{marginTop: '10px', fontWeight: 'bold', whiteSpace: 'pre'}}>
                        {`Exemplo de json esperado no retorno da query clearquest:

                            "oslc_cm:results": [
                               {
                                    externalId: 'SOL00081848', //identificador externo
                                    description: 'Breve descricao', //breve descricao
                                    title: 'Titulo deo caso de uso', //título que aparecerá no cartão
                                    classOfService: '588d4c9f55e11bdc25a9f779', //identificador da classe de serviço
                                    itemType: '588d4c9f55e11bdc25a9f77d', //identificador do tipo de item
                                    itemSize: '588d4c9f55e11bdc25a9f782', //identificador do tamanho do item
                                    metric: '588d4c9f55e11bdc25a9f785', //identificador da metrica
                                    metricValue: '2', //valor da métrica
                                    priorityNumber: '1', //valor numérico de prioridade
                                    priority: '588d4c9f55e11bdc25a9f775', //identificador da prioridade
                                    project: '588ea20e082f39e80daaf220', //identificador do projeto
                                    cardIdConfig: '58c1f814cc0578280e2215b8', //identificador do id do cartao, responsavel por gerar o id
                                    tags: '58c1f7f0cc0578280e22159e, 58c1f7f0cc0578280e22159e', //lista de tags separados por ,
                                    lane: '588d4c9f55e11bdc25a9f762', //identificador da raia
                                    assignedMembers: "Programador 1(prom1), Programador 2(prom2)", //nome completo e login dos executores separados por ,
                                    creatorLogin: "tes11", //login do criador do cartão
                                    creatorFullname: "Testador 1" //(nome do criador do cartao
                                    order: 1 //ordem dos cartões na raia (de 1 a 9999). Os cartões externos sempre aparecerão após os cartões criados no quadro
                                },
                                {...},
                                {...}
                            ];
                        `}
                        </div>
                    </Content>
                </Segment>
                <Segment className="blue">
                    <Header>
                        <Content><FormattedMessage {...messages.generic} /></Content>
                    </Header>
                    <Content className="k-new-setting">
                        <div> Para integração genérica, é necessário fornecer o token de acesso, caso necessários, e o nome do campo do header, que esse token precisa ser passado.</div>
                        <div style={{marginTop: '10px', fontWeight: 'bold', whiteSpace: 'pre'}}>
                        {`Exemplo de json esperado no retorno de webservice genérico esperado:
                            cards:
                            [
                                {
                                    externalId: 'SOL00081848', //identificador externo
                                    description: 'Breve descricao', //breve descricao
                                    title: 'Titulo deo caso de uso', //título que aparecerá no cartão
                                    classOfService: '588d4c9f55e11bdc25a9f779', //identificador da classe de serviço
                                    itemType: '588d4c9f55e11bdc25a9f77d', //identificador do tipo de item
                                    itemSize: '588d4c9f55e11bdc25a9f782', //identificador do tamanho do item
                                    metric: '588d4c9f55e11bdc25a9f785', //identificador da metrica
                                    metricValue: '2', //valor da métrica
                                    priorityNumber: '1', //valor numérico de prioridade
                                    priority: '588d4c9f55e11bdc25a9f775', //identificador da prioridade
                                    project: '588ea20e082f39e80daaf220', //identificador do projeto
                                    cardIdConfig: '58c1f814cc0578280e2215b8', //identificador do id do cartao, responsavel por gerar o id
                                    tags: ['58c1f7f0cc0578280e22159e', '58c1f7f0cc0578280e22159e'], //lista de tags
                                    lane: '588d4c9f55e11bdc25a9f762', //identificador da raia
                                    assignedMembers: [
                                        {fullname: "Programador 1", nickname:"prom1"},
                                        {fullname: "Programador 2", nickname:"prom2"},
                                    ],
                                    order: 1 //ordem dos cartões na raia (de 1 a 9999). Os cartões externos sempre aparecerão após os cartões criados no quadro
                                },
                                {...},
                                {...}
                            ];
                        `}
                        </div>
                    </Content>
                </Segment>
            </Container>
        );
    }
}

module.exports = injectIntl(TrackerIntegrationSettingDoc);
