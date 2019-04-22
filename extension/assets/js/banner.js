'use-strict';
void async function () {
    const { name, version } = chrome.runtime.getManifest()
    const header = document.getElementsByClassName('pass-header')[0]

    if (version == '0.0.0')
        header.innerText = name
    else {
        header.innerText = `${name} ${version}`
        header.addEventListener('click', function (event) {
            chrome.runtime.openOptionsPage(function () {
                setTimeout(function () { header.innerText = `${name} ${version}` }, 3000)
                header.innerText = 'No settings page.' 
            })
        })
    }
}()
