'use strict';

import {KanbanActions} from '../../../../actions';
import {ExtendedStore} from '../../../../commons';

class PreferenceSettingStore extends ExtendedStore
{
    constructor()
    {
        super();

        this.listenToAsyncFnAutoBind(KanbanActions.boardSetting.boardMember.getLoggedUserBoardPreference, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
        this.listenToAsyncFnAutoBind(KanbanActions.boardSetting.boardMember.updateBoardMemberPreference, this, {progressed: this.triggerEmpty, failed: this.triggerErrorMessage});
    }

    boardSetting_boardMember_getLoggedUserBoardPreference_completed(actionState, response)
    {
        this.triggerWithActionState(actionState, {boardMember: response.body.data});
    }

    boardSetting_boardMember_updateBoardMemberPreference_completed(actionState, response) //eslint-disable-line
    {
        this.triggerWithActionState(actionState, {boardMember: response.body.data});
    }

}

module.exports = new PreferenceSettingStore();
