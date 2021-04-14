export default class ReceiverGameLink {
    constructor(socket) {
        this.socket = socket

        socket.on('ready', this.gameReady.bind(this))
    }

    gameReady() {

    }

}
