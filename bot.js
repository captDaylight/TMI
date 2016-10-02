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
  good: 'good|great|awesome|alright|tight|sweet|amazing|excited|fun|best|better|ok',
  bad: 'bad|not|terrible|shit|crap|turd|fuck|awful|tired|bummer|exhausted|worse|nope|fine'
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
  'https://media.giphy.com/media/DYH297XiCS2Ck/giphy.gif',
  'https://media.giphy.com/media/bqrG9EUt9vS4U/giphy.gif',
  'https://media.giphy.com/media/2R78MsGSola12/giphy.gif',
  'https://media.giphy.com/media/xTiTnyijMsXgn6Bzzy/giphy.gif',
  'https://media.giphy.com/media/3NtY188QaxDdC/giphy.gif',
  'https://media.giphy.com/media/l0MYOwS7JDddcyo3m/giphy.gif',
  'https://media.giphy.com/media/rDbelKPujYEBq/giphy.gif',
  'https://media.giphy.com/media/10UeedrT5MIfPG/giphy.gif',
  'https://media.giphy.com/media/WyeodYfrqvHCo/giphy.gif',
  'https://media.giphy.com/media/3o7qDDQvIy2yj3QkoM/giphy.gif',
  'https://media.giphy.com/media/BQAk13taTaKYw/giphy.gif',
  'https://media.giphy.com/media/1EnVAKJGFjoM8/giphy.gif',
  'https://media.giphy.com/media/9Y6n9TR7U07ew/giphy.gif',

];

const negativeGifs = [
  'https://media.giphy.com/media/Nm8ZPAGOwZUQM/giphy.gif',
  'https://media.giphy.com/media/fpXxIjftmkk9y/giphy.gif',
  'https://media.giphy.com/media/7RbdFCczQWjQc/giphy.gif',
  'https://media.giphy.com/media/SDogLD4FOZMM8/giphy.gif',
  'https://media.giphy.com/media/8nmvR3jAxnl2o/giphy.gif',
  'https://media.giphy.com/media/WIAxZtUxUY000/giphy.gif',
  'https://media.giphy.com/media/5LeiUijss0afS/giphy.gif',
  'https://media.giphy.com/media/Dxlt1TY7WHLm8/giphy.gif',
  'https://media.giphy.com/media/LytiZGHa3DbCE/giphy.gif',
  'https://media.giphy.com/media/l41lJbSQXQbjYQgOA/giphy.gif',
  'https://media.giphy.com/media/bMehR5UxZuFS8/giphy.gif',
  'https://media.giphy.com/media/pStZ71z14R2Ks/giphy.gif',
  'https://media.giphy.com/media/3o6ZsXTJkgqLvrrH6E/giphy.gif',
  'https://media.giphy.com/media/3oEduEv8ykooQvuNEc/giphy.gif',
  'https://media.giphy.com/media/M0KZmnz5TDwf6/giphy.gif',
  'https://media.giphy.com/media/ikfLpQzXmbTnG/giphy.gif',
  'https://media.giphy.com/media/26ybw6AltpBRmyS76/giphy.gif',
  'https://media.giphy.com/media/3o6Zt0u5axHuOYOEH6/giphy.gif'
];

const byeGifs = [
  'https://media.giphy.com/media/Y8ocCgwtdj29O/giphy.gif',
  'https://media.giphy.com/media/GB0lKzzxIv1te/giphy.gif',
  'https://media.giphy.com/media/l2Sq5L1byCRgztEZi/giphy.gif',
  'https://media.giphy.com/media/3osxYpQ20pysGhUW08/giphy.gif',
  'https://media.giphy.com/media/l396M3jF14DXr9mog/giphy.gif',
  'https://media.giphy.com/media/26AHJ9mZjOjaTt8IM/giphy.gif',
  'https://media.giphy.com/media/d2Z32dYcs4S2Ov72/giphy.gif',
  'https://media.giphy.com/media/5xtDarEgBDjEoWo6VRS/giphy.gif',
  'https://media.giphy.com/media/trGtPJai2xwI/giphy.gif',
  'https://media.giphy.com/media/7iZmNXySAYexG/giphy.gif',
  'https://media.giphy.com/media/80HmBdIXjR2Cs/giphy.gif',
  'https://media.giphy.com/media/CfI69NjLvfkVa/giphy.gif',
  'https://media.giphy.com/media/Ih3HgezTb4wW4/giphy.gif'
];

const reactionPhrase = [
  'Wow, that\'s heavy.',
  'Thanks for sharing.',
  'Oh wow.',
  'I understand.',
  'Thank you for sharing',
  '<3'
]

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
  const rando = Math.floor(Math.random() * (data.length + 4))
  // const index = getRanIdx(data);
  const index = rando >= data.length ? data.length - 1 : rando;
  const problem = data[index];

  const tellSomethingPrivate = (response, convo) => {
    bot.reply(message, `${problem.intro} ${getRanItem(problem.tmi).toLowerCase()}`);
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

      bot.reply(message, getRanItem(reactionPhrase));
      bot.reply(message, `Take care. It was good talking to you.`);
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
      image_url: 'http://i.imgur.com/yRE93j0.jpg',
    }]});

    convo.ask(`${getRanItem(introPhrases)}. how are you?`, [
      // {
      //   pattern: patterns.good,
      //   callback: function(response,convo) {
      //     // do something else...
      //     bot.reply(message, {attachments: [{
      //       text: 'WOOF WOOF',
      //       image_url: getRanItem(positiveGifs),
      //     }]});

      //     askSimpleQuestion(response, convo, true);
      //     convo.next();
      //   }
      // },
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
          // convo.repeat();
          bot.reply(message, {attachments: [{
            text: 'WOOF WOOF',
            image_url: getRanItem(positiveGifs),
          }]});

          askSimpleQuestion(response, convo, true);
          convo.next();
          convo.next();
        }
      }
    ])
  });
});
