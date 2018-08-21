'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {addLocaleData, IntlProvider} from 'react-intl';

import pt from './locales/pt';
import * as pages from './pages';
import {LocalStorageManager} from './commons';
import {KanbanActions} from './actions';
import {AuthStore} from './stores';

function requireAuth(nextState, replace)
{
    if (AuthStore.getLoggedUser())
    {
        return true;
    }
    if (LocalStorageManager.isUserAuthenticated())
    {
        try
        {
            let decodedJwt = LocalStorageManager.getDecotedJwtToken();
            if (decodedJwt)
            {
                return true;
            }
        }
        catch (e)
        {
            //Sem autorização, segue o fluxo para ir para tela de login
        }
    }
    LocalStorageManager.setJwtToken(null);
    replace({pathname: '/login', state: {nextPathname: nextState.location.pathname}});
    return false;
}

function checkIfUserIsAlreadyAuthenticated()
{
    let initialPath = document.location.pathname; //eslint-disable-line no-undef
    let jwt = LocalStorageManager.getJwtToken();
    if (jwt)
    {
        KanbanActions.user.loginUserByJwt.asFunction(jwt, initialPath);
    }
}

addLocaleData(pt);
checkIfUserIsAlreadyAuthenticated();

//<IntlProvider locale="pt" defaultLocale="pt">
ReactDOM.render(
    <IntlProvider locale="pt" defaultLocale="pt">
        <Router history={browserHistory}>
            <Route path="/" component={pages.KanbanApp}>
                <IndexRoute component={pages.LoginPage}/>
                <Route path="/error" component={pages.ErrorPage}/>
                <Route path="/login" component={pages.LoginPage} />
                <Route path="/signup" component={pages.SignUpPage} />
                <Route path="/forgotPassword" component={pages.ForgotPasswordPage} />
                <Route path="/boards" component={pages.BoardListPage} onEnter={requireAuth} routerName="boards"/>
                <Route path="/boards/add" component={pages.BoardAddPage} onEnter={requireAuth}/>
                <Route path="/boards/:boardId" component={pages.BoardShowPage} onEnter={requireAuth}/>
                <Route path="/boards/:boardId/edit/layout" component={pages.BoardLayoutPage} onEnter={requireAuth}/>
                <Route path="/boards/:boardId/calendar" component={pages.BoardCalendarPage} onEnter={requireAuth}/>
                <Route path="/boards/:boardId/backlog" component={pages.BoardBacklogPage} onEnter={requireAuth}/>
                <Route path="/boards/:boardId/reports" component={pages.BoardReportPage} onEnter={requireAuth}>
                    <Route path="backlog" component={pages.BacklogReportPage} onEnter={requireAuth}/>
                    <Route path="archive" component={pages.ArchiveReportPage} onEnter={requireAuth}/>
                    <Route path="leadTime" component={pages.LeadTimeReportPage} onEnter={requireAuth}/>
                    <Route path="allocation" component={pages.AllocationReportPage} onEnter={requireAuth}/>
                </Route>
                <Route path="/boards/:boardId/settings" component={pages.BoardSettingPage} onEnter={requireAuth}>
                    <Route path="agings" component={pages.AgingSettingPage} onEnter={requireAuth}/>
                    <Route path="cardIdConfigs" component={pages.CardIdSettingPage} onEnter={requireAuth}/>
                    <Route path="classOfServices" component={pages.ClassOfServiceSettingPage} onEnter={requireAuth}/>
                    <Route path="customFieldConfigs" component={pages.CustomFieldConfigSettingPage} onEnter={requireAuth}/>
                    <Route path="generalConfig" component={pages.GeneralSettingPage} onEnter={requireAuth}/>
                    <Route path="impedimentTypes" component={pages.ImpedimentTypeSettingPage} onEnter={requireAuth}/>
                    <Route path="importExportBoard" component={pages.ImportExportSettingPage} onEnter={requireAuth}/>
                    <Route path="itemTypes" component={pages.ItemTypeSettingPage} onEnter={requireAuth}/>
                    <Route path="itemSizes" component={pages.ItemSizeSettingPage} onEnter={requireAuth}/>
                    <Route path="metrics" component={pages.MetricSettingPage} onEnter={requireAuth}/>
                    <Route path="permissions" component={pages.PermissionSettingPage} onEnter={requireAuth}/>
                    <Route path="preferences" component={pages.PreferenceSettingPage} onEnter={requireAuth}/>
                    <Route path="priorities" component={pages.PrioritySettingPage} onEnter={requireAuth}/>
                    <Route path="projects" component={pages.ProjectSettingPage} onEnter={requireAuth}/>
                    <Route path="tagCategories" component={pages.TagCategorySettingPage} onEnter={requireAuth}/>
                    <Route path="tags" component={pages.TagSettingPage} onEnter={requireAuth}/>
                    <Route path="taskTypes" component={pages.TaskTypeSettingPage} onEnter={requireAuth}/>
                    <Route path="trackerIntegrations/help" component={pages.TrackerIntegrationSettingDoc} onEnter={requireAuth}/>
                    <Route path="trackerIntegrations" component={pages.TrackerIntegrationSettingPage} onEnter={requireAuth}/>
                    <Route path="ratingTypes" component={pages.RatingTypeSettingPage} onEnter={requireAuth}/>
                </Route>
                <Route path="/user/timesheet" component={pages.UserTimesheetPage} onEnter={requireAuth}/>
                <Route path="/user/profile" component={pages.UserProfilePage} onEnter={requireAuth}/>
            </Route>
            <Route path="*" component={pages.NoMatchPage}/>
        </Router>
    </IntlProvider>
    , document.getElementById('app') //eslint-disable-line no-undef
);
