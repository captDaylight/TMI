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
const patterns = {
  good: /^(good|great|awesome|alright|tight|sweet)/i,
  bad: /^(bad|not|terrible|shit|crap|turd|fuck)/i
};

const introPhrases = [
  'Hi! I’m Buddy',
  'Woof woof! Lol',
  'You can trust me, because I am a dog',
  `WOOF! I'm a dog`
];

const simpleQuestions = [
  'What’s your name?',
  'Do you like to party?',
  'Where are you from?',
];

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

  const tellSomethingPrivate = (response, convo) => {
    const ranTMIIndex = Math.floor(Math.random() * problem.tmi.length);
    bot.reply(message, `${problem.intro}, ${problem.tmi[ranTMIIndex]}`);
    bot.reply(message, '...');
    askSomethingPrivate(response, convo);
    convo.next();
  }

  const askSomethingPrivate = (response, convo) => {
    convo.ask(problem.question, function(response, convo) {
      const tmi = convo.extractResponse('userTMI');
      if (tmi.length > 20) {
        saveTMI(index, tmi);
      }

      bot.reply(message, `WOW that's super heavy.`);
      bot.reply(message, `OK well, great talking to you`);
      // bot.reply(message, {'image_url': 'http://r.ddmcdn.com/s_f/o_1/cx_633/cy_0/cw_1725/ch_1725/w_720/APL/uploads/2014/11/too-cute-doggone-it-video-playlist.jpg'});
      bot.reply(message, {attachments: [{
        "text": "WOOF WOOF",
        "image_url": "https://media.giphy.com/media/10Fqkgb4tQVtOo/giphy.gif",
      }]});
      convo.next();
    }, {key: 'userTMI'});
  };

  const askIfCanAsk = (response, convo) => {
    convo.ask('Can I tell you something', [
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
  };

  const askSimpleQuestion = (response, convo, wasPositive = true) => {
    convo.ask(`${wasPositive ? 'WOOF! Wow so great to hear' : 'OH WOOF WOOF BUMMER'}. ${simpleQuestions[Math.floor(Math.random() * simpleQuestions.length)]}`, [
      {
        default: true,
        callback: function(response,convo) {
          // just repeat the question
          askIfCanAsk(response, convo);
          convo.next();
        }
      }
    ])
  };

  bot.startConversation(message,function(err,convo) {
    convo.ask(`${introPhrases[Math.floor(Math.random() * introPhrases.length)]}. how are you?`, [
      {
        pattern: patterns.good,
        callback: function(response,convo) {
          // do something else...
          askSimpleQuestion(response, convo, true);
          convo.next();
        }
      },
      {
        pattern: patterns.bad,
        callback: function(response,convo) {
          // do something else...
          askSimpleQuestion(response, convo, false);
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
    ])
  });
});
