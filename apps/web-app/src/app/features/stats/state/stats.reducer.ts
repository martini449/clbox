import {createReducer} from '@reduxjs/toolkit';
import {statsFetched} from './stats-fetched';
import {statsFetchedReducer} from './stats-fetched.reducer';
import {StatsState} from './stats-state';
import {statsStateInitial} from './stats-state-initial';

export const statsReducer = createReducer<StatsState>(
  statsStateInitial,
  builder => builder
    .addCase(statsFetched, statsFetchedReducer)
)
