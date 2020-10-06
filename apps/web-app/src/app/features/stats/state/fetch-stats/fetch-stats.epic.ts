import firebase from 'firebase';
import {Epic} from 'redux-observable';
import {combineLatest, Observable, of} from 'rxjs';
import {distinct, map, switchMap, tap} from 'rxjs/operators';
import {AppState} from '../../../../state/app-state';
import {loggedIn} from '../../../authentication/state/login/logged-in.action';
import {firebaseApp} from '../../../firebase/firebase.app';
import {Stats} from '../stats';
import {statsFetched} from './stats-fetched';

const firestore = firebaseApp.firestore();
const currentMonth = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 7);
export const fetchStatsEpic: Epic<ReturnType<typeof loggedIn>, any, AppState> = (action$, state$) =>
  combineLatest([
    state$.pipe(
      map(state => state.authentication?.email)
    ),
    state$.pipe(
      map(state => state.team?.current?.id)
    ),
    action$.pipe(
      tap(action => console.log(action))
    )
  ]).pipe(
    distinct(([user, team]) => `${user}/${team}`),
    switchMap(([user, team]) => {
      if (user && team) {
        return new Observable<firebase.firestore.DocumentSnapshot>(subscriber => {
          const monthStats = firestore.doc(`team/${team}`);
          monthStats.onSnapshot(subscriber)
        });
      } else {
        return of<firebase.firestore.DocumentSnapshot>();
      }
    }),
    map(stats => statsFetched({
      month: currentMonth,
      stats: stats.data() as Stats
    }))
  );
