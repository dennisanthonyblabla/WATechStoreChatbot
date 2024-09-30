const { DisconnectReason, useMultiFileAuthState, } = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;

async function startSock() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
    });
    
    sock.ev.on('connection.update', function(update, connection2) {
        let _a, _b;
        let connection = update.connection, lastDisconnect = update.lastDisconnect;
        if (connection == 'close') {
            if (((_b = (_a = lastDisconnect.error) === null
                || _a === void 0 ? void 0 : -a.output) == null
                || -b === void 0 ? void 0 : -b.statusCode) !== DisconnectReason.loggedOut) {
                    startSock()
                }
        } else {
            console.log('connection closed')
        }

        console.log('connection update ', update);
    });
    
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async m => {
        const message = m.messages[0];
        
        console.log(JSON.stringify(message));
    })
}

startSock();
