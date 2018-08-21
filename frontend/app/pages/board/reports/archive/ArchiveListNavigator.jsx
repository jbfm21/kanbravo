'use strict';

import React from 'react';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

const messages = defineMessages(
{
    showPrevious: {id: 'archiveListNavigator.showPrevious', description: '', defaultMessage: 'Anterior'},
    showNext: {id: 'archiveListNavigator.showNext', description: '', defaultMessage: 'Próximo'}
});

class ArchiveListNavigator extends React.Component
{
    static displayName = 'CommentNavigator';

    static propTypes =
    {
        onPrevious: React.PropTypes.func.isRequired,
        onNext: React.PropTypes.func.isRequired,
        cursorBeforeValue: React.PropTypes.string,
        cursorAfterValue: React.PropTypes.string,
        limit: React.PropTypes.number.isRequired,
        totalInDb: React.PropTypes.number.isRequired,
        intl: intlShape.isRequired
    };

    constructor(props)
    {
        super(props);
    }

    _handleOnPrevious = (e) =>
    {
        //Como a ordenação é descendente a navegação é invertida
        e.preventDefault();
        this.props.onNext(this.props.cursorAfterValue, this.props.limit);
    }

    _handleOnNext = (e) =>
    {
        //Como a ordenação é descendente a navegação é invertida
        e.preventDefault();
        this.props.onPrevious(this.props.cursorBeforeValue, this.props.limit);

    }

    render()
	{
        const {limit} = this.props;
        return (
            <div style={{marginBottom: '5px', marginLeft: '10px', display: 'inline-flex', height: '5%', fontSize: '14px', fontWeight: 'bold'}}>
                <div style={{display: 'inline-flex', color: '#365899', fontWeight: 'inherit', fontSize: 'inherit'}}>
                    <div onClick={this._handleOnPrevious}><span style={{cursor: 'pointer'}}><FormattedMessage {...messages.showPrevious} values={{limit: limit}}/></span></div>
                </div>
                <div style={{display: 'inline-flex', color: '#365899', fontWeight: 'inherit', fontSize: 'inherit', marginLeft: '50px'}}>
                    <div onClick={this._handleOnNext}><span style={{cursor: 'pointer'}}><FormattedMessage {...messages.showNext} values={{limit: limit}}/></span></div>
                </div>
            </div>
        );
    }
}
module.exports = injectIntl(ArchiveListNavigator);
