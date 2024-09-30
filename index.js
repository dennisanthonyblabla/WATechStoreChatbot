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
        console.log('yellow '+JSON.stringify(msg));

        const generate = async (type, url) => {
            const generated = await generateWAMessageContent({
                [type]: { url }
            }, {
                upload: sock.waUploadToServer
            })
            return generated[`${type}Message`]
        }

        let sectionmsg = generateWAMessageFromContent(msg.key.remoteJid, {
            viewOnceMessage: {
              message: {
                "messageContextInfo": {
                  "deviceListMetadata": {},
                  "deviceListMetadataVersion": 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                  header: proto.Message.InteractiveMessage.Header.create({
                    title:"Data Kakak belum tercatat di data pelanggan kami 😔",
                  }),
                  body: proto.Message.InteractiveMessage.Body.create({
                    text: "Apakah Kakak mau buat data baru?"
                  }),
                  footer: proto.Message.InteractiveMessage.Footer.create({
                    text: "Data kakak aman terjaga di database customer kami."
                  }),
                //   header: proto.Message.InteractiveMessage.Header.create({
                //     title: ``,
                //     // videoMessage: await generate("image", { url: thumbnail }),
                //     hasMediaAttachment: false
                //   }),
                  nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Ya",
                        id: "id 1"
                    })
                },{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Tidak",
                        id: "id 2"
                    })
                }]
                  })
                })
              }
            }
          }
        , {
            ephemeraExpiration: 86400,
            quoted: msg
          })

    if (m.type === 'notify') {
        console.log("Nomer Pengirim: " + msg.key.remoteJid);
        console.log("Isi Pesan: " + msg.message.conversation);
        if (msg.key.remoteJid.includes('@s.whatsapp.net')) {
            if (msg.message) {
                if (msg.message.conversation == 'Cek status') {
                    axios.get("https://script.google.com/macros/s/AKfycbz_C372ST8sSvrrqlX0jLsME8D9XgHZ_gbBQyLgVML1OTtIGBHJWyJ_72DWmitRgmloiw/exec?whatsapp="+ msg.key.remoteJid.replace('@s.whatsapp.net',''))
                    .then(async (response) => {
                        console.log(response.data);
                        const {success, data, message} = response.data;
                        let str;
                        if (success) {
                            // str = `Hi ${data.nama}`
                            str = `Halo kak ${data.nama}\n\nStatus Cucian anda \nNo Order : ${data.no_order}\nJenis Layanan : ${data.jenis_layanan}\nTotal Baya : ${data.total_bayar}\n\nStatus : ${data.status}`

                            await sock.sendMessage(msg.key.remoteJid, {
                                text: str
                            })
                        } else {
                            await sock.relayMessage(msg.key.remoteJid, sectionmsg.message, {
                                messageId: sectionmsg.key.id
                            })
                            isRegistering = true;
                        }
                    });

                    // await sock.relayMessage(msg.key.remoteJid, sectionmsg.message, {
                    //     messageId: sectionmsg.key.id
                    //   })
                } else if (msg.message.conversation == 'Magic keyword dennis'){
                    await sock.sendMessage(msg.key.remoteJid, {
                        // text: 'Selamat Datang. Ini Dinda. Silahkan tulis \'cek Status\' untuk check status pesanan roti anda!'
                        messageId: sectionmsg.key.id
                    }) 
                } else if (isRegistering) {
                    if (msg.message.buttonsResponseMessage.selectedDisplayText == 'Ya'){
                        axios.post("https://script.google.com/macros/s/AKfycbzJDDhPxuwbG2QFQZoUnnPlBOIeQdgL7vxqRBOpi7UuyHAF0kfwalPVNWbVd5SvhRtKrQ/exec?name=" + msg.pushName + "&whatsapp="+ msg.key.remoteJid.replace('@s.whatsapp.net',''))
                        .then(async (response) => {
                            console.log(response.data);
                            if (response.data == 200) {
                                str = 'Baik Data kakak sudah berhasil kami catat. Silahkan tulis \'Cek status\' untuk memastikan data Kakak sudah benar.'
                                isRegistering = false;
                                await sock.sendMessage(msg.key.remoteJid, {
                                    text: str
                                })
                            }
                    });
                    } else if (msg.message.buttonsResponseMessage.selectedDisplayText == 'Tidak'){
                        await sock.sendMessage(msg.key.remoteJid, {
                            text: 'Baik untuk data Kakak saat ini tidak kami catat ya Kak.'
                        })
                        isRegistering = false;
                    }
                } else {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: 'Selamat datang di Dennis Tech Store! Silahkan ketik \'Cek status\' untuk melihat status pesanan anda.'
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