# Moodle_Auto_Captcha

#### This is an Chrome extension, it helps you fill in the verification code when you logging into the [Moodle](https://moodle.ncku.edu.tw/).
-------------------------------
## How to use
1. Create an API key from either the [Gemini](https://aistudio.google.com) or the [Google Cloud Vision](https://cloud.google.com/vision) (choose only one) and paste it into the configuration area in content.js.
2. Load the extension into Chrome via `chrome://extensions/`.
3. Navigate to the Moodle login page, and the verification code will be automatically filled in automatically.
<img width="1454" alt="image" src="https://github.com/user-attachments/assets/53e71d61-ffe2-4e8c-bcfb-19bb7bf75ea8">

## Gemini vs. Google Cloud Vision

|               | Gemini                              | Google Cloud Vision               |
|----------------------|-------------------------------------|------------------------------------|
| Response Time        | Slower    | Faster      |
| API Key Setup        | Simple  | Complex   |
| Accuracy             | High    | Low       |
