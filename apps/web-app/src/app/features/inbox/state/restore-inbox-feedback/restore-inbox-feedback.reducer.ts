import {Draft} from '@reduxjs/toolkit';
import {InboxState} from '../inbox-state';
import {MessageState} from '../../../message/model/message-state';
import {restoreInboxFeedback} from './restore-inbox-feedback.action';

export const restoreInboxFeedbackReducer = (state: Draft<InboxState>, action: ReturnType<typeof restoreInboxFeedback>) => {
    state.messages.byId[action.payload.message.id].state = MessageState.Pending
};
