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
  good: 'good|great|awesome|alright|tight|sweet',
  bad: 'bad|not|terrible|shit|crap|turd|fuck'
};

const introPhrases = [
  'Hi! I’m Buddy',
  'Woof woof! Lol',
  'You can trust me, because I am a dog',
  `WOOF! I'm a dog`
];

const positiveGifs = [
  'https://media.giphy.com/media/h2MLtoOjxtkGY/giphy.gif',
  'https://media.giphy.com/media/YXPZ3W7UAVOZW/giphy.gif',
  'https://media.giphy.com/media/3o7abBP0nMjrdIvaCY/giphy.gif',
  'https://media.giphy.com/media/LLHkw7UnvY3Kw/giphy.gif',
  'https://media.giphy.com/media/DYH297XiCS2Ck/giphy.gif',
  'https://media.giphy.com/media/bqrG9EUt9vS4U/giphy.gif',
];

const negativeGifs = [
  'https://media.giphy.com/media/Nm8ZPAGOwZUQM/giphy.gif',
  'https://media.giphy.com/media/fpXxIjftmkk9y/giphy.gif',
  'https://media.giphy.com/media/7RbdFCczQWjQc/giphy.gif',
  'https://media.giphy.com/media/SDogLD4FOZMM8/giphy.gif',
  'https://media.giphy.com/media/8nmvR3jAxnl2o/giphy.gif',
  'https://media.giphy.com/media/WIAxZtUxUY000/giphy.gif',
  'https://media.giphy.com/media/5LeiUijss0afS/giphy.gif'
];

const byeGifs = [
  'https://media.giphy.com/media/3orieStB8OH7lanfGg/giphy.gif',
  'https://media.giphy.com/media/Y8ocCgwtdj29O/giphy.gif',
];

const getRanIdx = array => Math.floor(Math.random() * array.length);
const getRanItem = array => array[getRanIdx(array)];

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
  const index = getRanIdx(data);
  const problem = data[index];

  const tellSomethingPrivate = (response, convo) => {
    bot.reply(message, `${problem.intro}, ${getRanItem(problem.tmi)}`);
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
      bot.reply(message, {attachments: [{
        text: 'WOOF WOOF',
        image_url: getRanItem(byeGifs),
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
    convo.ask(`${wasPositive ? 'WOOF! Wow so great to hear' : 'OH WOOF WOOF BUMMER'}. ${getRanItem(simpleQuestions)}`, [
      {
        default: true,
        callback: function(response,convo) {
          // just repeat the question
          bot.reply(message, {attachments: [{
            text: 'WOOF WOOF',
            image_url: getRanItem(positiveGifs),
          }]});
          askIfCanAsk(response, convo);
          convo.next();
        }
      }
    ])
  };

  bot.startConversation(message,function(err,convo) {
    bot.reply(message, {attachments: [{
      text: 'WOOF WOOF',
      image_url: 'https://lh3.googleusercontent.com/WmDO6Z1gcsWsDfwXl5lJZrZVQ-hmyItX6InqGmGZb746rQgd3S6Rc76wsuFtyOG7gdeXafqm6vljhlo=w1316-h803',
    }]});

    convo.ask(`${getRanItem(introPhrases)}. how are you?`, [
      {
        pattern: patterns.good,
        callback: function(response,convo) {
          // do something else...
          bot.reply(message, {attachments: [{
            text: 'WOOF WOOF',
            image_url: getRanItem(positiveGifs),
          }]});

          askSimpleQuestion(response, convo, true);
          convo.next();
        }
      },
      {
        pattern: patterns.bad,
        callback: function(response,convo) {
          // do something else...
          bot.reply(message, {attachments: [{
            text: 'ARF ARF WOOF',
            image_url: getRanItem(negativeGifs),
          }]});

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
