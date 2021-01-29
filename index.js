const Discord = require('discord.js')
const axios = require('axios')
const bots = require('./bots.json')
const WebSocket = require('ws')
const socket = new WebSocket('wss://ws.finnhub.io?token=c09imbv48v6trcjbr50g')
const events = require('events')
const emitter = new events.EventEmitter()

socket.addEventListener('open', e => {
    for (let i of bots) socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': i.symbol }))
});

// Listen for messages
socket.addEventListener('message', event => {
    try {
        for (let i of JSON.parse(event.data).data) {
            try { emitter.emit(i.s, i.p) } catch (er) { console.log(er) }
        }
    } catch (er) {
        console.log(er)
    }
});

for (let i of bots) {
    let currentprice
    const bot = new Discord.Client()
    bot.login(i.botKey)
    bot.on('ready', () => {
        emitter.on(i.symbol, p => { currentprice = p })
    })
    setInterval(() => {
        if (currentprice) {
            bot.guilds.cache.each(g => {
                try {
                    let m = g.members.cache.get(bot.user.id)
                    if (!m) return
                    let nick = `${i.stock}: $${currentprice}`
                    if (nick == m.nickname) return
                    m.setNickname(`${i.stock}: $${currentprice}`)
                } catch (er) { console.log(er) }

            })
        }
    }, 1100)
}