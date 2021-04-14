import './style.css'
import {io} from 'socket.io-client'
import {v4 as uuid} from 'uuid'
import QRCode from 'qrcode/lib/browser'

const $ = document.querySelector.bind(document)
const isCast = window.location.search.substr(1) !== 'pc'
console.log('is cast: ', isCast)

const socket = io('https://cast.leoboyer.dev')
function configSocket(id) {
    socket.emit('config', {
        id,
        type: 'cast'
    })
}

if (isCast) {
    $('.cast-waiting').style.display = 'block'
    const context = cast.framework.CastReceiverContext.getInstance();
    context.addCustomMessageListener('urn:x-cast:com.pnk.poccast', function(customEvent) {
        if(customEvent.data.type === "syncID"){
            configSocket(customEvent.data.text)
        }
    });
    context.start()
} else {
    $('.pc-waiting').style.display = 'block'
    const id = uuid()
    console.log(id)
    QRCode.toCanvas($('#qrcode'), id, function (error) {
        if (error) console.error(error)
        configSocket(id)
    })
}

socket.on('ready', () => {
    $('.pc-waiting').style.display = 'none'
    $('.cast-waiting').style.display = 'none'
    $('.game').style.display = 'flex'
    game()
})

function delay(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay);
    });
}

async function game() {
    let gameturn = 0 // 0 = cast, 1 = player
    const switchGameTurn = () => {
        gameturn = 1 - gameturn
        socket.emit('game-data', {
            type: 'turn',
            turn: gameturn
        })
    }
    let playerScore = 0
    let opponentScore = 0
    const updateScore = () => {
        $('.score-player').innerText = playerScore
        $('.score-opponent').innerText = opponentScore
    }


    // defining listenners
    socket.on('game-data', async data => {
        if (data.type === 'roll') {
            switchGameTurn()
            $('#player-dice').innerText = data.number
            await delay(100)
            $('.dice.player').classList.add('visible')
            await delay(1000)
            playCastTurn(data.number)
        }
    })
    const playCastTurn = async (playerDice) => {
        const diceVal = Math.round(Math.random() * 6) + 1
        $('#opponent-dice').innerText = diceVal
        if (playerDice > diceVal) {
            playerScore++
        } else if (playerDice < diceVal) {
            opponentScore++
        }
        updateScore()
        await delay(2000)
        $('.dice.player').classList.remove('visible')
        await delay(100)
        switchGameTurn()
        $('#opponent-dice').innerText = '...'
        socket.emit('game-data', {
            type: 'diceVal',
            val: '...'
        })
    }

    // run game
    await delay(2000)
    switchGameTurn()
}
