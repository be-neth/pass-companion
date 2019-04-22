'use-strict';
const fs = require('fs')
const path = require('path')

const locations = [
    '.config/BraveSoftware/Brave-Browser',
    '.config/google-chrome',
    '.config/chromium'
]

const json = JSON.stringify({
    'name': 'com.kakolisgay.passcompanion',
    'description': 'Native Worker for Pass Companion.',
    'path': path.join(process.env['PWD'], 'native.js'),
    'type': 'stdio',
    'allowed_origins': [
        'chrome-extension://hhacogoelclmfhjecgbfhmlmefaaigjg/'
    ]
})

if (process.argv[2] == '-')
    return process.stdout.write(json)

console.log(`${new Date().toJSON()} Packet -> ${json}`)

for (const i in locations) {
    const dir = path.join(process.env['HOME'], locations[i])
    const filepath = path.join(dir, 'NativeMessagingHosts', 'com.kakolisgay.passcompanion.json')
    const exists = (function () { try { fs.readdirSync(dir); return true } catch (exception) { return false } })()
    if (exists) {
        console.log(`${new Date().toJSON()} Written to ${filepath}`)
        fs.writeFileSync(filepath, json)
    }
}

return console.log(`${new Date().toJSON()} Done`)
