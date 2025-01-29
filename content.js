let Gemini_API_KEY = ''
let Cloud_Vision_API_KEY = ''

function getBase64Image(image) {
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

async function recognize_captcha_by_Cloud_Vision_API(image) {
    let base64Image = getBase64Image(image)
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${Cloud_Vision_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requests: [
                {
                    image: {
                        content: base64Image
                    },
                    features: [
                        {
                            type: 'TEXT_DETECTION',
                            maxResults: 1
                        }
                    ],
                    imageContext: {
                        languageHints: ['en']
                    }
                }
            ]
        })
    })
    try {
        const data = await response.json();
        console.log(data)
        
        let Verification_Code = '';
        const recognizedText = data.responses[0].textAnnotations[0]?.description;
        const lines = recognizedText.split('\n');
        for (const line of lines) {
            Verification_Code = line.match(/\d+/g).join('');
            if (Verification_Code.length == 4) break;
        }

        if (Verification_Code.length != 4) {
            Verification_Code = recognizedText.match(/\d+/g).join('');
        }

        return Verification_Code
    } catch (error) {
        console.error("The API key is not valid or out of quota. Please check your API key")
        return null;
    }
}

async function recognize_captcha_by_Gemini(image) {
    let base64Image = getBase64Image(image)
    const prompt = 'Please analyze this CAPTCHA image and extract the 4-digit numeric code. The image contains colorful digits on a white background with some noise/distortion. Return only the numeric digits without any additional text or explanation.'
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${Gemini_API_KEY}`;

    const body = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": base64Image
                        }
                    }
                ]
            }
        ],
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    try {
        const data = await response.json();
        console.log(data)

        const Verification_Code = data.candidates[0].content.parts[0].text.trim()
        return Verification_Code
    } catch (error) {
        console.error("The API key is not valid or out of quota. Please check your API key")
        return null;
    }
}

async function initApiKeys() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['geminiApiKey', 'cloudVisionApiKey'], (result) => {
            Gemini_API_KEY = result.geminiApiKey || '';
            Cloud_Vision_API_KEY = result.cloudVisionApiKey || '';
            resolve();
        });
    });
}

async function recognize_and_fill(image) {
    await initApiKeys();

    if(Cloud_Vision_API_KEY == '' && Gemini_API_KEY == ''){
        console.error("Please click the extension icon and set your API key.");
        return;
    }

    var Verification_Code = Cloud_Vision_API_KEY != '' ? 
        await recognize_captcha_by_Cloud_Vision_API(image) : 
        await recognize_captcha_by_Gemini(image);

    const inputField = document.getElementById('reg_vcode');
    inputField.value = Verification_Code;
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
