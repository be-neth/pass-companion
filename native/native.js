#!/usr/bin/env node
'use-strict';
const { inspect } = require('util')
const { bufferToJSON, packup, parseNative, rreaddir, nComWrite } = require('./lib/utils.js')
const PassUtils = require('./lib/passUtils.js')
process.stdin.on('data', function (raw) {
    //console.error(raw)
    const { data, size } = parseNative(raw)
    const { command, query } = bufferToJSON(data)
    //console.error('Buffer', 'sizeof', size, command)
    const pass = new PassUtils()

    if (query && query.includes('./'))
        return nComWrite({
            'name': 'Bad query',
            'message': 'The query supplied appears to be malformed.'
        })

    switch (command) {

        case 'readdir':
            void async function () {
                return nComWrite(pass.passTrim(await rreaddir(pass.store)))
            }()
            break

        case 'readusername':
            void async function () {
                const { username } = pass.cafParse(await pass.readFile(query))
                return nComWrite({ username })
            }()
            break

        case 'readpassword':
            void async function () {
                const { password } = pass.cafParse(await pass.readFile(query))
                return nComWrite({ password })
            }()
            break

        case 'readotp':
            void async function () {
                const code = await pass.getOTP(query)
                return nComWrite({ 'otp': code })
            }()
            break

        case 'ping':
            void async function () {
                return nComWrite({ 'name': 'Pass Companion (Native)' })
            }()
            break

        default:
            nComWrite({
                'name': 'Bad command',
                'message': 'Requested operation is not supported or is invalid.'
            })
            return
    }
})

