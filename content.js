const API_KEY = 'Your_Gooele_Cloud_Vision_AI_API_Key';


function getBase64Image(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
}


function recognizeText(img) {
    let base64Image = getBase64Image(img)
    fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.responses && data.responses.length > 0) {
                if (data.responses[0].error) {
                    console.error('OCR 錯誤:', data.responses[0].error.message);
                } else {
                    const recognizedText = data.responses[0].textAnnotations[0]?.description;
                    console.log(recognizedText)
                    let Verification_Code = '';

                    const lines = recognizedText.split('\n');
                    for (const line of lines) {
                        Verification_Code = line.match(/\d+/g).join('');
                        if (Verification_Code.length == 4) break;
                    }

                    if (Verification_Code.length != 4) {
                        Verification_Code = recognizedText.match(/\d+/g).join('');
                    }

                    const inputField = document.getElementById('reg_vcode');
                    inputField.value = Verification_Code;

                }
            } else {
                console.error('無法獲得有效的回應', data);
            }
        })
        .catch(error => {
            console.error('請求錯誤:', error);
        });
}

const img = document.getElementById('imgcode');
if (img) {
    if(img.complete){
        recognizeText(img);
    }else{
        img.addEventListener('load', () => {
            recognizeText(img);
        });
    }   
}
