import React from 'react';
import * as airflux from 'airflux';
import {KanbanActions} from '../../../../actions';
import {Header, Segment, Button} from 'react-semantify';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {Container, Content, Meta, FaIcon, Description} from '../../../../components';

const messages = defineMessages(
{
    title: {id: 'importExport.title', description: 'importExport Setting title', defaultMessage: 'Descrição'},
    subtitle: {id: 'importExport.subtitle', description: 'importExport Setting subtitle', defaultMessage: 'Importação e exportação de dados'},
    exportBasicInformationTitle: {id: 'exportBasicInformationTitle.title', description: 'export  basic information title', defaultMessage: 'Exportação'},
    exportText: {id: 'exportBasicInformationTitle.text', description: 'export  text', defaultMessage: 'Clique no botão de download para exportar os cartões existentes, cancelado e arquivados do quadro, além dos timesheets e impedimentos registrados no formato CSV.'},
    exportDownload: {id: 'exportBasicInformationTitle.downloadButton', description: 'export download button', defaultMessage: 'Download'}
});


@airflux.FluxComponent
class ImportExportSettingPage extends React.Component
{
    static displayName = 'ImportExportSettingPage';

    static propTypes =
    {
        params: React.PropTypes.object,
        intl: intlShape.isRequired
    };

    _handleExportBoard = () =>
    {
        KanbanActions.boardActions.exportData.asFunction(this.props.params.boardId);
    }

    render()
    {
        let iconHeaderStyle = {marginRight: 10 + 'px'};
        return (
            <Container className={`setting segments ${this.pageName}`}>
                <Segment className="clearing">
                    <Header className="left floated">
                        <FormattedMessage {...messages.title} />
                        <Meta style={{fontSize: '14px', lineHeight: '1.4285em', fontWeight: 'normal', marginTop: '10px'}}><FormattedMessage {...messages.subtitle} /></Meta>
                    </Header>
                </Segment>
                <Segment className="red">
                    <Header>
                        <FaIcon className="fa-list-alt" style={iconHeaderStyle}/><Content><FormattedMessage {...messages.exportBasicInformationTitle} /></Content>
                    </Header>
                    <Content className="add form">
                        <Description style={{marginTop: '10px'}}>
                            <FormattedMessage {...messages.exportText}/>
                        </Description>
                        <Button onClick={this._handleExportBoard} style={{marginTop: '10px'}}> <FormattedMessage {...messages.exportDownload}/></Button>
                    </Content>
                </Segment>
            </Container>
        );
    }
}

module.exports = injectIntl(ImportExportSettingPage);
