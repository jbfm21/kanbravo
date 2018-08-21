import React, {Component, PropTypes} from 'react';

import {BasicProgress, ProgressBar} from '../../../../../../components';
import {FunctionHelper} from '../../../../../../commons';


export default class ScopeProgressBar extends Component
{
    static propTypes =
    {
        widgedStyle: PropTypes.object,
        scope: PropTypes.object.isRequired,
        isToRender: PropTypes.bool
    };

    static defaultProps =
    {
        isToRender: true
    };

    render()
    {
         const {scope, widgedStyle, isToRender} = this.props;
         if (FunctionHelper.isUndefined(scope) || !isToRender)
         {
             return null;
         }
         return (
             <BasicProgress style={widgedStyle.container}>
                 <ProgressBar className="progress-bar-finished" show="percent" percent={scope.finished.percentual} style={widgedStyle.progressBar}/>
                 <ProgressBar className="progress-bar-started" show="percent" percent={scope.started.percentual} style={widgedStyle.progressBar}/>
                 <ProgressBar className="progress-bar-notStarted" show="percent" percent={scope.notStarted.percentual} style={widgedStyle.progressBar}/>
                 <ProgressBar className="progress-bar-notDetailed" show="percent" percent={scope.notDefined.percentual} style={widgedStyle.progressBar}/>
             </BasicProgress>
        );
    }
}
