'use-strict';
const fs = require('fs')
const cp = require('child_process')
const path = require('path')

module['exports'] = class PassUtils {
    'constructor' () {
        this.store = `${process.env['HOME']}/.password-store`
        this.cafSeperator = ': ' // ": " is used to avoid false postitives.
        this.cafRegex = /^[A-z \-\_]{1,32}(\: )/
    }

    'passTrim' (raw) {
        let list = []
        for (const i in raw)
            if (raw[i].startsWith(this.store)) {
                const pack = raw[i].slice(this.store.length+1)
                list.push(pack.slice(0, pack.length-4)) }
        return list
    }

    'read' (file) {
        const { store } = this
        return new Promise(function (resolve, reject) {
            const filename = path.isAbsolute(file) ? file : path.join(store, `${file}.gpg`)
            const buffer = []
            const worker = cp.spawn('gpg', [ '--decrypt', '--yes', '--quiet', '--batch', '-' ])
            worker.stdout.on('data', function (raw) { buffer.push(raw) })
            worker.stderr.once('data', function (raw) { worker.kill('SIGTERM'); return reject(raw.toString()) })
            worker.once('close', function () { return resolve(Buffer.concat(buffer)) })
            fs.createReadStream(filename).pipe(worker.stdin)
        })
    }

    'getOTP' (file) {
        const { store } = this
        return new Promise(function (resolve, reject) {
            const buffer = []
            const worker = cp.spawn('pass', [ 'otp', file ])
            worker.stderr.once('data', function (raw) { return resolve(undefined) })
            worker.stdout.on('data', function (raw) { buffer.push(raw) })
            worker.once('close', function () {
                const code = Buffer.concat(buffer).toString().replace(/[^0-9]/g, '')
                return resolve(code.length ? code : undefined)
            })
        })
    }

    'readFile' (file) {
        const self = this
        return (async function (){
            return (await self.read(file)).toString()
        })()
    }

    /*'bulkRead' (dir) {
        // Bulk reading has servere performance issues
        // Not using for now.
        const self = this
        return (async function (){
            let a = {}
            for (const i in dir) {
                console.log('Reading', dir[i])
                a[dir[i]] = self.cafParse(await self.readFile(dir[i])) }
            return a
        })()
    }/**/

    'cafParse' (string) {
        const spl = string.split('\n')
        const data = {}
        for (const i in spl)
            if (i == '0')
                // Line 0 is completely untouched because attempting to parse random giberish is probably a bad idea.
                data['password'] = spl[i]
            else
                if (this.cafRegex.test(spl[i])) {
                    const name = spl[i].split(this.cafSeperator)[0]
                    data[name.toLowerCase()] = spl[i].slice(name.length+this.cafSeperator.length)
                }

        return data
    }

}
