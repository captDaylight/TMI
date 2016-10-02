if (!process.env.token) {
  process.exit(1);
}

const Botkit = require('botkit');

const controller = Botkit.slackbot({
  debug: true,
});

controller.spawn({
  token: process.env.token,
}).startRTM();

const JsonDB = require('node-json-db');
var db = new JsonDB('data', true, false);

// console.log(db.push('/chat',{chat}));
// here starts the action ---
var data = db.getData('/chat');

const { hears } = controller;

const saveTMI = (index, tmi) => {
  const data = db.getData('/chat');
  const problem = data[index];
  problem.tmi.push(tmi);
  data[index] = problem;
  db.push('/chat', data);
};

controller.on('direct_message,direct_mention,mention', function(bot, message) {
  const data = db.getData('/chat');
  const index = Math.floor(Math.random() * data.length);
  const problem = data[index];

  // saveTMI(index, 'hello');

  const tellSomethingPrivate = (response, convo) => {
    const ranTMIIndex = Math.floor(Math.random() * problem.tmi.length);
    bot.reply(message, `${problem.intro}, ${problem.tmi[ranTMIIndex]}`);
    console.log('----setting timeout!!');
    setTimeout(() => {

      askSomethingPrivate(response, convo);
      convo.next();
    }, 100);
    // askSomethingPrivate(response, convo);
  }

  const askSomethingPrivate = (response, convo) => {
    convo.ask(problem.question, function(response, convo) {
      const tmi = convo.extractResponse('userTMI');
      // TODO make sure we're getting the tmi data from the question
      saveTMI(index, tmi);
      convo.next();
    }, {key: 'userTMI'});
  };

  bot.startConversation(message,function(err,convo) {
    convo.ask('Can I tell you something',[
      {
        pattern: bot.utterances.yes,
        callback: function(response,convo) {
          // do something else...
          tellSomethingPrivate(response, convo);
          convo.next();
        }
      },
      {
        pattern: bot.utterances.no,
        callback: function(response,convo) {
          // do something else...
          askSomethingPrivate(response, convo);
          convo.next();
        }
      },
      {
        default: true,
        callback: function(response,convo) {
          // just repeat the question
          convo.repeat();
          convo.next();
        }
      }
    ]);
  });
});
