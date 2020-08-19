import {Message} from '../../message/model/message';

export interface InboxState {
    messages: {
        byId: { [key: string]: Message }
    };
}
