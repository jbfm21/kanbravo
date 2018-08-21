'use strict';

//TODO: internacionalizar atributo title das tags

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';
import * as airflux from 'airflux';
import {List, Item} from 'react-semantify';

const messages = defineMessages(
{
    headerTitle: {id: 'projectLane.header.title', description: 'Project lane header title', defaultMessage: 'Projetos'}
});


@airflux.FluxComponent
export default class HeaderLane extends React.Component
{
    static displayName = 'HeaderLane';
    constructor(props)
    {
        super(props);
    }
    render()
	{
        let containerStyle = null;
        let upperCaseStyle = 'uppercase';
        return (
            <div className="header default mouse" style={containerStyle}>
                <div style={{lineHeight: 1}}>
                    <List className="horizontal" style={{padding: '0px', display: 'inline-flex', width: '100%', backgroundColor: '#ddd'}}>
                        <Item style={{width: '100%'}} >
                            <div className={`title ${upperCaseStyle} text`} style={{height: '22px', width: 'inherit'}}>
                                <FormattedMessage {...messages.headerTitle} />
                            </div>
                        </Item>
                    </List>
                </div>
            </div>
        );
    }
}

