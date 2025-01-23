// ----------------------configuration------------------------------
const Gemini_API_KEY = 'Your_Gooele_Gemini_API_Key';
const Cloud_Vision_API_KEY = 'Your_Gooele_Cloud_Vision_AI_API_Key';
// -----------------------------------------------------------------

function getBase64Image(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
}

async function recognize_captcha_by_Cloud_Vision_API(img) {
    let base64Image = getBase64Image(img)
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

async function recognize_captcha_by_Gemini(img) {
    let base64Image = getBase64Image(img)
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

    let Verification_Code = data.candidates[0].content.parts[0].text.trim()
    return Verification_Code
}

async function recognize_and_fill(img) {
    var Verification_Code = ""
    if (Gemini_API_KEY != 'Your_Gooele_Gemini_API_Key') {
        Verification_Code = await recognize_captcha_by_Gemini(img);
    } else if (Cloud_Vision_API_KEY != 'Your_Gooele_Cloud_Vision_AI_API_Key') {
        Verification_Code = await recognize_captcha_by_Cloud_Vision_API(img);
    } else {
        console.error('API_KEY is not defined');
        return;
    }
    const inputField = document.getElementById('reg_vcode');
    inputField.value = Verification_Code;
}

const img = document.getElementById('imgcode');
if (img) {
    if (img.complete) {
        recognize_and_fill(img);
    } else {
        img.addEventListener('load', () => {
            recognize_and_fill(img);
        });
    }
}
