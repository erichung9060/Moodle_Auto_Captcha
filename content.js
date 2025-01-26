let Gemini_API_KEY = ''
let Cloud_Vision_API_KEY = ''

function getBase64Image(image) {
    const canvas = document.createElement('canvas');
    const width = 800; // Resize width
    const aspectRatio = image.height / image.width; // Maintain aspect ratio
    const height = width * aspectRatio;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw the resized image
    ctx.drawImage(image, 0, 0, width, height);

    // Apply sharpening filter (simple unsharp mask simulation)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Example of sharpening (basic increase in contrast)
        data[i] = Math.min(255, data[i] * 1.2);     // Red
        data[i + 1] = Math.min(255, data[i + 1] * 1.2); // Green
        data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Blue
    }

    ctx.putImageData(imageData, 0, 0);

    // Return the base64-encoded string of the processed image
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
}

async function recognize_captcha_by_Gemini(image) {
    let base64Image = getBase64Image(image)
    const prompt = 'This is a captcha image. Tell me what numbers or letters are in this image. The captcha is 4 characters long. Just tell me the captcha, no other characters.'
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

    const data = await response.json();
    console.log(data)

    const Verification_Code = data.candidates[0].content.parts[0].text.trim()
    return Verification_Code
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

    var Verification_Code = ''

    if (Cloud_Vision_API_KEY != '') {
        Verification_Code = await recognize_captcha_by_Cloud_Vision_API(image);
    } else if (Gemini_API_KEY != '') {
        Verification_Code = await recognize_captcha_by_Gemini(image);
    } else {
        console.error('API_KEY is not defined');
        return;
    }
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