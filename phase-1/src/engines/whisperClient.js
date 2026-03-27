'use strict';

const FormData = require('form-data');
const https    = require('https');

/**
 * Send an audio buffer to OpenAI Whisper and return the transcript text.
 * @param {Buffer} audioBuffer  Raw audio bytes (webm/opus from MediaRecorder)
 * @param {string} lang         BCP-47 language code e.g. 'ko', 'en'
 * @returns {Promise<string>}   Transcript text
 */
async function transcribe(audioBuffer, lang = 'ko') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const form = new FormData();
  form.append('file', audioBuffer, { filename: 'audio.webm', contentType: 'audio/webm' });
  form.append('model', 'whisper-1');
  form.append('language', lang.split('-')[0]); // 'ko-KR' → 'ko'
  form.append('response_format', 'json');

  return new Promise((resolve, reject) => {
    const headers = {
      ...form.getHeaders(),
      'Authorization': `Bearer ${apiKey}`,
    };

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/audio/transcriptions',
      method: 'POST',
      headers,
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Whisper API ${res.statusCode}: ${body}`));
        }
        try {
          resolve(JSON.parse(body).text || '');
        } catch {
          reject(new Error('Invalid Whisper response'));
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

module.exports = { transcribe };
