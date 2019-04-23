'use-strict';
const settings = (function (string) {
    if (string)
        return JSON.parse(string)
    else {
        const json = { 'hideOTP': false }
        localStorage.setItem('pass.settings', JSON.stringify(json))
        return json
    }
})(localStorage.getItem('pass.settings'))
console.debug(settings)

if (chrome.runtime.sendNativeMessage)
    void async function () {
        const { getCurrentTab, getTree, HTMLEscape, ignoredOrigins, queryStore, setBorder, setResultsView } = await import('./utils.mjs')
        const { readdir, readOTP, readPassword, readUsername, sendNativeMessage, sendQuery } = await import('./native.mjs')
        const { url } = await getCurrentTab()
        const { host, origin } = new URL(url || 'chrome://blank') // Pseudo-url to make sure this constant doesn't fail.
        if (!ignoredOrigins.includes(origin)) document.getElementById('pass-query').placeholder = host
        const directory = await readdir()

        const onChange = async function (override) {
            const el = document.querySelector('#pass-results')
            const value = override || document.getElementById('pass-query').value.toLowerCase()

            if (value.length) {
                setResultsView(false)
                const results = await queryStore(directory, value)
                el.innerHTML = ''
                for (const i in results) {
                    const id = `${Date.now()}-${i}`
                    el.innerHTML += 
                    `<li class="list-group-item d-flex justify-content-between align-items-center" data-filename=${JSON.stringify(results[i].filename)}>` +
                        HTMLEscape(results[i].filename) +
                        '<ul class="list-inline list-flush">' +
                            '<li class="btn btn-link list-inline-item list-slim-button list-button-username" href="#" type="button"><i class="material-icons">account_circle</i></li>' +
                            '<li class="btn btn-link list-inline-item list-slim-button list-button-password" href="#" type="button"><i class="material-icons">vpn_key</i></li>' +
                            (!settings.hideOTP
                              ? '<li class="btn btn-link list-inline-item list-slim-button list-button-totp" href="#" type="button"><i class="material-icons">code</i></li>'
                              : '') +
                        '</ul>' +
                    '</li>'

                    //new Collapse(document.getElementById(`${id}`))
                }

                setResultsView(true)
                setBorder(!!results.length)
            } else {
                el.innerHTML = ''
                setBorder(false)
                setResultsView(true)
            }
        }

        const genericHandleClipboard = async function (string, element) {
            console.debug('Handle', string, 'Element', element)
            if (string)
                await navigator.clipboard.writeText(string)
            else {
                element.disabled = true
                element.classList.add('disabled')
                //element.title = 'The requested resource does not exist'
            }
        }

        const elResults = document.querySelector('#pass-results')
        elResults.addEventListener('click', async function (event) {
            const [ , button, , item ] = event.path
            const { filename }  = item.dataset
            const elUsername    = event.target.closest('.list-button-username')
            const elpassword    = event.target.closest('.list-button-password')
            const elCode        = event.target.closest('.list-button-totp')
            console.debug(readUsername, readPassword, readOTP)

            try {
                console.debug('Item', item)
                if (elUsername && elResults.contains(elUsername))
                    await genericHandleClipboard(await readUsername(filename), button)
                else if (elpassword && elResults.contains(elpassword))
                    await genericHandleClipboard(await readPassword(filename), button)
                else if (elCode && elResults.contains(elCode)) {
                    console.debug('Code Req')
                    const code = await readOTP(filename)
                    console.debug('Code', code)
                    await genericHandleClipboard(code, button) }
                else
                    console.debug('Null click')
            } catch (exception) {
                return console.error('Exception in Click', item, exception)
            }
        })

        if (document.getElementById('pass-query').value.toLowerCase().length)
            onChange()
        else if (!ignoredOrigins.includes(origin))
            onChange(host)

        document.getElementById('pass-query').addEventListener("input", function () { onChange() })
        setResultsView(true)
    }()
      .catch(function (exception) {
        document.getElementById('pass-events').innerHTML = 
        '<div class="alert alert-danger no-margin-bottom pass-alert" role="alert">' +
            '<p>An exception occoured. Stacktrace below</p><br />' +
            `<pre>${HTMLEscape(exception ? exception.stack || exception : 'undefined')}</pre>` +
        '</div>'
      })
else {
    void async function () {
        const { setResultsView } = await import('./utils.mjs')
        document.getElementById('pass-permissions-request').addEventListener('click', async function (event) {
            const permission = { 'permissions': ['activeTab', 'nativeMessaging'] }
            return chrome.permissions.request(permission, function (granted) {
                if (granted)
                    return location.reload()
            })

        })
        setResultsView(true)
        document.getElementById('pass-query').disabled = true
        document.getElementById('pass-permissions').hidden = false
    }()
}
