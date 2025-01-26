chrome.storage.sync.get(['geminiApiKey', 'cloudVisionApiKey'], (result) => {
    document.getElementById('geminiKey').value = result.geminiApiKey || '';
    document.getElementById('cloudVisionKey').value = result.cloudVisionApiKey || '';
});


document.getElementById('saveKeys').addEventListener('click', () => {
    const geminiKey = document.getElementById('geminiKey').value;
    const cloudVisionKey = document.getElementById('cloudVisionKey').value;

    chrome.storage.sync.set({
        geminiApiKey: geminiKey,
        cloudVisionApiKey: cloudVisionKey
    }, () => {
        window.close();
    });
});