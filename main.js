import './style.css'
import {io} from 'socket.io-client'

const socket = io()
const context = cast.framework.CastReceiverContext.getInstance();
context.addCustomMessageListener('urn:x-cast:com.pnk.poccast', function(customEvent) {
    if(customEvent.data.type === "syncID"){
        socket.emit('config', {
            id: customEvent.data.text,
            type: 'cast'
        })
    }
});
context.start()