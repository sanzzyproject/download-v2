// api/download.js
const axios = require('axios');

module.exports = async (req, res) => {
    // Izinkan CORS agar bisa diakses dari frontend mana saja (opsional, aman untuk Vercel)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request browser
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Hanya menerima method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        if (!url.includes('https://')) {
            throw new Error('Invalid URL format. Must use https://');
        }

        // --- MULAI LOGIKA ASLI KAMU ---
        
        // 1. Get Cookies / Analytics
        const { headers } = await axios.get('https://downr.org/.netlify/functions/analytics', {
            headers: {
                referer: 'https://downr.org/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });
        
        // 2. Post Download Request
        const { data } = await axios.post('https://downr.org/.netlify/functions/download', {
            url: url
        }, {
            headers: {
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'content-type': 'application/json',
                'cookie': headers['set-cookie']?.join('; ') || '',
                'origin': 'https://downr.org',
                'referer': 'https://downr.org/',
                'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });

        // --- SELESAI LOGIKA ASLI ---

        // Kirim hasil balik ke frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error("Backend Error:", error.message);
        return res.status(500).json({ 
            error: 'Failed to process download', 
            details: error.message 
        });
    }
};
