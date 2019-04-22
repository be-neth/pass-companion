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

const onChange = function (el, i) {
    settings[i] = el.checked ? true : false
    localStorage.setItem('pass.settings', JSON.stringify(settings))
}

const elFlags = document.getElementById('pass-flags')
for (const i in settings) {
    const id = `flag-${i}`
    elFlags.innerHTML +=
    '<li class="list-group-item d-flex justify-content-between align-items-center">' +
        `<label for="${id}" style="margin:0em;"><pre style="margin:0em;">${i}</pre></label>` +
        `<input type="checkbox" id="${id}" name="${id}"${settings[i] == true ? ' checked' : ''}>` +
    '</li>'

    document.getElementById(id).onchange = function () {
        onChange(document.getElementById(id), i)
    }
}
