import * as nodeFetch from 'node-fetch';
import {PendingKudosMessage} from '../pending-kudos-message';
import {SlackUser} from '../slack/slack-user';

import {SlackUserIndex} from '../slack/slack-user-index';
import {SlackUserProfile} from '../slack/slack-user-profile';

function now() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

async function sendSlackMessage(slackHttpHeaders: { Authorization: string; 'Content-type': string }, channel: string, message: string) {
  await nodeFetch(`https://slack.com/api/chat.postMessage`, {
    method: 'POST',
    headers: slackHttpHeaders,
    body: JSON.stringify({
      channel: channel,
      text: message
    })
  });
}

function message(forUser: SlackUserProfile, fromUser: SlackUserProfile, payload: PendingKudosMessage) {
  return {
    date: now(),
    for: forUser.email,
    forName: forUser.display_name,
    forSlack: payload.mention,
    from: fromUser.email,
    fromName: fromUser.display_name,
    fromSlack: payload.user,
    message: payload.feedback
  };
}

function failedToDeliverCollection(firebase: typeof import('firebase-admin'), team) {
  return firebase.firestore().collection(`team/${team}/inbox/failed-to-deliver/message`)
}

async function failedToSendFeedback(firebase: typeof import('firebase-admin'), headers, payload: PendingKudosMessage, error: string, message: string) {
  console.error(JSON.stringify({
    msg: error, payload
  }));
  return Promise.all([
    sendSlackMessage(headers, `@${payload.user}`, message),
    failedToDeliverCollection(firebase, payload.team).add({
      msg: error, date: now(), payload
    })
  ]);
}

export const sendFeedbackFactory = (
  functions: import('firebase-functions').FunctionBuilder,
  config: import('firebase-functions').config.Config,
  firebase: typeof import('firebase-admin')) => {
  const slackHttpHeaders = {
    Authorization: `Bearer ${config.slack.bottoken}`,
    'Content-type': 'application/json'
  };
  const usersIndexPromise: Promise<SlackUserIndex> = nodeFetch(`https://slack.com/api/users.list`, {headers: slackHttpHeaders})
    .then(res => res.json())
    .then(res => res.members)
    .then(
      (users: SlackUser[]) => users.reduce((index, user) => ({
          ...index,
          [user.name]: user
        }),
        {}
      )
    );

  return functions.pubsub.topic('pending-slack-notifications').onPublish(
    async (topicMessage, context) => {
      const usersIndex = await usersIndexPromise;
      const payload: PendingKudosMessage = JSON.parse(Buffer.from(topicMessage.data, 'base64').toString());

      const fromUser: SlackUserProfile = usersIndex[payload.user]?.profile;
      const forUser: SlackUserProfile = usersIndex[payload.mention]?.profile;
      if (!forUser) {
        await failedToSendFeedback(
          firebase,
          slackHttpHeaders,
          payload,
          `Can't find user`,
          `User mentioned in feedback (${payload.mention}) not found.`
        );
      }

      const firestore = firebase.firestore();
      const userCollection = firestore.collection(`team/${payload.team}/user/`);
      const chapterLeader = (await userCollection.doc(forUser.email).get())?.data()?.chapterLeader;

      if (chapterLeader !== undefined) {
        await firestore.runTransaction(async trn => {
          const inboxDoc = firestore.collection(`team/${payload.team}/inbox/${chapterLeader}/message`).doc();
          const sentDoc = firestore.collection(`team/${payload.team}/sent/${fromUser.email}/message`).doc(inboxDoc.id);
          trn.set(inboxDoc, message(forUser, fromUser, payload));
          trn.set(sentDoc, message(forUser, fromUser, payload));
        });
      } else {
        await failedToSendFeedback(
          firebase,
          slackHttpHeaders,
          payload,
          `Can't find user chapter leader`,
          `User mentioned in feedback (${payload.mention}) has no chapter leader.`
        );
      }
    }
  );
}
