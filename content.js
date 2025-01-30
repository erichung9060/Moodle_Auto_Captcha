function get_Base64_Image(image) {
    const canvas = document.createElement('canvas');
    const width = 800; // Resize width
    const aspectRatio = image.height / image.width;
    const height = width * aspectRatio;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    
    // Convert directly to base64 without any processing
    return canvas.toDataURL('image/png').split(',')[1];
}

async function recognize_and_fill(image) {
    let base64Image = get_Base64_Image(image)
    const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
            { action: "recognizeCaptcha", image: base64Image },
            (response) => {
                resolve(response);
            }
        );
    });

    const inputField = document.getElementById('reg_vcode');
    if (response.Verification_Code) {
        inputField.value = response.Verification_Code;
    } else {
        console.error(response.error);
        inputField.value = "";
    }
}

const image = document.getElementById('imgcode');
if (image) {
    if (image.complete) {
        recognize_and_fill(image);
    }
    image.addEventListener('load', () => {
        recognize_and_fill(image);
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "apiKeyUpdated") {
        console.log("apiKeyUpdated")
        if (image) recognize_and_fill(image);
    }
});