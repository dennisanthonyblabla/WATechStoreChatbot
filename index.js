const { DisconnectReason, useMultiFileAuthState, } = require("@whiskeysockets/baileys");
const { text } = require("wd/lib/commands");
const makeWASocket = require("@whiskeysockets/baileys").default;
const axios = require('axios');
let isRegistering = false;

//interactive message
const pkg =  require("@whiskeysockets/baileys");
const { proto, generateWAMessageFromContent, generateWAMessageContent } = pkg;

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
                || _a === void 0 ? void 0 : -a.output) === null
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
        const msg = m.messages[0];
        console.log(JSON.stringify(msg));

        const generate = async (type, url) => {
            const generated = await generateWAMessageContent({
                [type]: { url }
            }, {
                upload: sock.waUploadToServer
            })
            return generated[`${type}Message`]
        }

    if (m.type === 'notify') {
        // console.log("Nomer Pengirim: " + msg.key.remoteJid);
        // console.log("Isi Pesan: " + msg.message.conversation);
        if (msg.key.remoteJid.includes('@s.whatsapp.net')) {
            if (msg.message) {
                messageContains = msg.message.conversation.toLowerCase();
                if (messageContains == 'cek status') {
                    axios.get("https://script.google.com/macros/s/AKfycbxlGu9roa88zTGxjfN63QyQZXQC-8U-19XwA9mP54xUpuntkZmh41DZ1ywSNbi0uCiPBQ/exec?method=getCustOrder&whatsapp="+ msg.key.remoteJid.replace('@s.whatsapp.net',''))
                    .then(async (response) => {
                        console.log(response.data);
                        const {success, orderData, message} = response.data;
                        let str;
                        let date = new Date(orderData.estimasi_selesai).toLocaleDateString('id-ID');
                        if (success) {
                            str = `Halo kak ${orderData.nama},\nBerikut status cucian anda \n\nNo Order : ${orderData.no_order}\nBerat cucian : ${orderData.quota_yang_dipesan}\nEstimasi Selesai : ${date}\n\nStatus : ${orderData.status}`

                            await sock.sendMessage(msg.key.remoteJid, {
                                text: str
                            })

                            await sock.sendMessage(msg.key.remoteJid, {
                                text: `Quota cucian yang tersisa : ${orderData.sisa_quota} dari ${orderData.quota_bulan_ini}`
                            })
                        }
                    });
                } else {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: 'Selamat datang di Cleancare! Silahkan ketik \'Cek status\' untuk melihat status pesanan anda.'
                    })
                }
            }
        }
    }
        
        // if (msg.message.conversation == 'Cek status') {
        //     await sock.sendMessage(msg.key.remoteJid, {
        //         text: 'Hey! You got me!'
        //     })
        // } else if (msg.message.conversation == 'magic keyword dennis'){
        //     await sock.sendMessage(msg.key.remoteJid, {
        //         text: 'Selamat Datang. Ini Dinda. Silahkan tulis \'cek Status\' untuk check status pesanan roti anda!'
        //     })
        // }
    })
}

startSock();