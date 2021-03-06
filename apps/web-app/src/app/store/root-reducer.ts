import {combineReducers} from '@reduxjs/toolkit';
import {connectRouter} from 'connected-react-router';
import {authenticationReducer} from '../features/authentication/state/authentication.reducer';
import {inboxReducer} from '../features/inbox/state/inbox.reducer';
import {sentReducer} from '../features/sent/state/sent.reducer';
import {statsReducer} from '../features/stats/state/stats.reducer';
import {teamReducer} from '../features/team/state/team.reducer';

export const rootReducer = history => combineReducers({
  router: connectRouter(history),
  authentication: authenticationReducer,
  team: teamReducer,
  inbox: inboxReducer,
  sent: sentReducer,
  stats: statsReducer,
});
