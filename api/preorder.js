module.exports = async (req, res) => {
    // Add CORS headers for Vercel Serverless Function
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!googleScriptUrl || googleScriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        return res.status(500).json({
            status: 'error',
            message: 'ระบบหลังบ้านของ Vercel ยังไม่ได้ระบุ GOOGLE_SCRIPT_URL ใน Environment Variables ค่ะ'
        });
    }

    try {
        const response = await fetch(googleScriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Vercel serverless preorder error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'ไม่สามารถส่งคำขอพรีออเดอร์ไปยัง Google Sheets ได้ในขณะนี้ ค่ะ'
        });
    }
};
