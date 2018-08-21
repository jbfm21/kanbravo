'use strict';

import React from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

const messages = defineMessages(
    {welcomeMessage: {
        id: 'homePage.welcome',
        description: 'Welcome Message',
        defaultMessage: 'Seja bem vindo'
    }
});

export default class HomePage extends React.Component
{
    static displayName = 'HomePage';

    render()
    {
        return (
            <FormattedMessage {...messages.welcomeMessage} />
        );
    }
}
