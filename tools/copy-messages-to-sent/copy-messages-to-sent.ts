const firebase = require('firebase-admin');

const [, , ...args] = process.argv;
const team = args[0];
const project = args[1];

if (!team || !project) {
  throw new Error(`expected team projectId`);
}

firebase.initializeApp({
  projectId: project
});

(async function () {
  console.log(`Looking for messages in inbox`);
  const inbox = firebase.firestore().collection(`team/${team}/inbox/`);
  const users = await inbox.listDocuments();
  const userMessages: any[][] = await Promise.all(users
    .filter(user => user.id !== `failed-to-deliver`)
    .map(user => {
      console.log(`Looking for user inbox messages [user=${user.id}]`);
      return user.collection('message').get().then(snapshot => snapshot.docs.map(message => ({
        id: message.id,
        ...message.data()
      })));
    }));
  const messages = userMessages.reduce((all, user) => [...all, ...user], []);
  await Promise.all(messages.map(async message => {
    const sentDoc = firebase.firestore().collection(`team/${team}/sent/${message.from}/message`).doc(message.id);
    const sent = await sentDoc.get();
    if (!sent.exists) {
      console.log(`Inserting missing sent message [id=${message.id}, user=${message.from}]`);
      await sentDoc.set({
        ...message,
      });
    }
  }));
  console.log(`All sent messages generated from current inboxes`);
})();
