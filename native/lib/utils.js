const fs = require('fs')
const path = require('path')
const lp = function (len, expected) {
    return new Buffer.from('\0'.repeat(expected-len))
}

let exportable = {
    'packup': function (raw) {
        const packet = JSON.stringify(raw)
        const pl = new Buffer.alloc(4)
        pl.writeUInt32LE(packet.length, 0)
        const buf = Buffer.concat([ pl, new Buffer.from(packet) ])
        return buf
    },

    'parseNative': function (buf) {
        const size = buf.readUInt32LE(0)
        const data = buf.slice(4, buf.length)
        return { size, data }
    },

    'bufferToJSON': function (buf) {
        return JSON.parse(buf.toString())
    },

    'readdir': function (directory) {
        return new Promise(function (resolve) {
            fs.readdir(directory, { 'withFileTypes': true }, function (error, files) {
                return error ? reject(error) : resolve(files)
            })
        })
    }

}

// This kind of shit is why I export classes instead of objects
exportable.nComWrite = function (json) {
    return process.stdout.write(exportable.packup(json))
}

exportable.rreaddir = async function (root, hidden=false) {
    const returns = []
    const recursive = async function (target) {
        const files = await exportable.readdir(target)
        for (const i in files) {
            const dirpath = path.join(target, files[i].name)
            if (!hidden && files[i].name.startsWith('.'))
                continue
            if (files[i].isDirectory())
                await recursive(dirpath)
            else
                returns.push(dirpath)
        }
        return
    }

    await recursive(root)
    return returns
}

module['exports'] = exportable
