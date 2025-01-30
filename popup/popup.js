chrome.storage.local.get(['Gemini_API_KEY', 'Cloud_Vision_API_KEY'], (result) => {
    document.getElementById('geminiKey').value = result.Gemini_API_KEY || '';
    document.getElementById('cloudVisionKey').value = result.Cloud_Vision_API_KEY || '';
});


document.getElementById('saveKeys').addEventListener('click', () => {
    const geminiKey = document.getElementById('geminiKey').value;
    const cloudVisionKey = document.getElementById('cloudVisionKey').value;

    chrome.storage.local.set({
        Gemini_API_KEY: geminiKey,
        Cloud_Vision_API_KEY: cloudVisionKey
    }, () => {
        window.close();
    });
});