chrome.storage.local.get(['Gemini_API_KEY', 'Cloud_Vision_API_KEY'], (result) => {
    document.getElementById('geminiKey').value = result.Gemini_API_KEY || '';
    document.getElementById('cloudVisionKey').value = result.Cloud_Vision_API_KEY || '';
});


document.getElementById('saveKeys').addEventListener('click', async () => {
    const geminiKey = document.getElementById('geminiKey').value;
    const cloudVisionKey = document.getElementById('cloudVisionKey').value;

    await chrome.runtime.sendMessage({ 
        action: 'api_key_updated', 
        geminiKey, 
        cloudVisionKey 
    });
    window.close();
});
