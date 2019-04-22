'use-strict';
export const sendNativeMessage = function (data) {
    return new Promise(function (resolve) {
        chrome.runtime.sendNativeMessage('com.kakolisgay.passcompanion', data, function (packet) {
            console.debug('Command', data.command, packet)
            return resolve(packet)
        })
    })
}

export const sendNative = async function (command) {
    return await sendNativeMessage({ command })
}

export const readdir = async function () {
    return await sendNative('readdir')
}

export const readUsername = async function (query) {
    return (await sendNativeMessage({ 'command': 'readusername', query })).username
}

export const readPassword = async function (query) {
    return (await sendNativeMessage({ 'command': 'readpassword', query })).password
}

export const readOTP = async function (query) {
    return (await sendNativeMessage({ 'command': 'readotp', query })).otp
}
export const sendPing = async function (query) {
    return (await sendNativeMessage({ 'command': 'ping' })).otp
}
