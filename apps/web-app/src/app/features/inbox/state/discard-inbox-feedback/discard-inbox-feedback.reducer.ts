import {Draft} from '@reduxjs/toolkit';
import {InboxState} from '../inbox-state';
import {MessageState} from '../../../message/model/message-state';
import {discardInboxFeedback} from './discard-inbox-feedback.action';

export const discardInboxFeedbackReducer = (state: Draft<InboxState>, action: ReturnType<typeof discardInboxFeedback>) => {
    state.messages.byId[action.payload.message.id].state = MessageState.Discarded
};
