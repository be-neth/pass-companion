'use-strict';
export const ignoredOrigins = [ 'chrome://newtab', 'chrome://blank' ]
export const getCurrentTab = function () {
    return new Promise(function (resolve) {
        chrome.tabs.getSelected(function (tab) {
            return resolve(tab)
        })
    })
}

export const HTMLEscape = function (char) {
    // Copied from kakolisgay/markdown
    if (char.length == 0)
        return ''
    let a = ''
    const b = char.split('')
    for (const i in b) // Although this may not always work, It should the majority of the time. Any edgecases should be easily fixable
        a += (/[a-z0-9-_\'\:\/=+@,.\~\`?!£$%^*\(\)\[\{\]\}\n\ ]/i.test(b[i])
          ? b[i]
          : `&#x${b[i].charCodeAt(0).toString(16)};`)
    //console.log(a)
    return a
}

export const setBorder = function (value) {
    if (value)
        document.getElementById('input-query').classList.add('border-bottom')
    else
        document.getElementById('input-query').classList.remove('border-bottom')
}

export const queryStore = async function (tree, value) {
    const results = []
    for (const i in tree)
        if (tree[i].includes(value))
            results.push({ 'filename': tree[i] })

    return results
}

export const setResultsView = function (value) {
    document.querySelector('.pass-spinner').hidden = value
    document.getElementById('pass-results').hidden = !value
}
