const tmi = require('tmi.js');
const fetch = require('node-fetch');

const CHANNEL_NAME = process.env.CHANNEL_NAME;
const BOT_USERNAME = process.env.BOT_USERNAME;
const OAUTH_TOKEN = process.env.OAUTH_TOKEN;
const API_URL = process.env.API_URL;

const client = new tmi.Client({
  channels: [CHANNEL_NAME],
  identity: {
    username: BOT_USERNAME,
    password: OAUTH_TOKEN
  }
});

client.connect().then(() => {
  console.log('✅ Bot verbunden mit', CHANNEL_NAME);
}).catch(console.error);

// 💬 Chat Nachricht
client.on('message', async (channel, tags, message, self) => {
  if (self) return;
  
  try {
    await fetch(`${API_URL}/api/bot/chat-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twitch_id: tags['user-id'],
        twitch_username: tags.username
      })
    });
    console.log('📝 Chat:', tags.username);
  } catch (error) {
    console.error('❌ Chat Error:', error.message);
  }
});

// 🎁 Geschenk-Sub
client.on('subgift', async (channel, username, streakMonths, recipient, methods, tags) => {
  try {
    await fetch(`${API_URL}/api/bot/gifted-sub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twitch_id: tags['msg-param-recipient-id'],
        gifter_id: tags['user-id']
      })
    });
    console.log('🎁 Gifted Sub:', username, '→', recipient);
  } catch (error) {
    console.error('❌ Gifted Sub Error:', error.message);
  }
});

// 🌟 Subscription
client.on('subscription', async (channel, username, method, message, tags) => {
  try {
    await fetch(`${API_URL}/api/bot/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twitch_id: tags['user-id'],
        tier: tags['msg-param-sub-plan']
      })
    });
    console.log('⭐ Sub:', username);
  } catch (error) {
    console.error('❌ Sub Error:', error.message);
  }
});

// 💎 Bits
client.on('cheer', async (channel, tags, message) => {
  try {
    await fetch(`${API_URL}/api/bot/bits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twitch_id: tags['user-id'],
        bits_amount: parseInt(tags.bits)
      })
    });
    console.log('💎 Bits:', tags.username, '-', tags.bits);
  } catch (error) {
    console.error('❌ Bits Error:', error.message);
  }
});

console.log('🤖 Bot läuft auf Railway/Render...');
console.log('📺 Channel:', CHANNEL_NAME);
console.log('🔗 API:', API_URL);
