import {combineEpics} from 'redux-observable';
import {fetchStatsEpic} from './fetch-stats.epic';

export const statsEpic = combineEpics(
  fetchStatsEpic
)
