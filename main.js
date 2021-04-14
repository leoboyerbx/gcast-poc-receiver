import './style.css'
import {io} from 'socket.io-client'
import {v4 as uuid} from 'uuid'
import QRCode from 'qrcode/lib/browser'

const $ = document.querySelector.bind(document)
const isCast = window.location.search.substr(1) !== 'pc'

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
    $('.waiting').style.display = 'none'
    $('.game').style.display = 'block'
})
