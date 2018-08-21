import React, {Component} from 'react';
import * as airflux from 'airflux';
import {Segment} from 'react-semantify';
import {Content} from '../../../components';

@airflux.FluxComponent
class UnderConstructionTab extends Component
{
    static displayName = 'TaskTab';

    constructor(props)
    {
       super(props);
    }

    render()
    {
        return (
            <div style={{marginTop: '10px'}}>
                <Segment className="red">
                    <Content className="k-new-setting">
                        Em breve, mais uma novidade para você....Por enquanto, as tarefas e os campos customizados só poderão ser cadastrados após a criação do cartão. Para editar
                        um cartão de duplo-clique.
                    </Content>
                </Segment>
            </div>
        );
    }
}

module.exports = UnderConstructionTab;
