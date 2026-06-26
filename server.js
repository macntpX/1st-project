const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static landing page files
app.use(express.static(path.join(__dirname)));

// System Instruction for the AI Chatbot to define its persona and knowledge base
const SYSTEM_INSTRUCTION = `
คุณคือ "น้องมานี" ผู้ช่วย AI อัจฉริยะประจำร้าน "มานี มีถ้วย คาเฟ่" (Manee Mee Thuay Cafe)
หน้าที่ของคุณคือบริการต้อนรับลูกค้า ให้ข้อมูล ตอบคำถามเกี่ยวกับเมนูเครื่องดื่ม โปรโมชั่น และข้อมูลทั่วไปของร้านอย่างอบอุ่น สุภาพ เป็นกันเอง มีหางเสียงลงท้าย "ค่ะ/ครับ" ตามความเหมาะสม (แนะนำให้ใช้น้ำเสียงเป็นกันเอง อบอุ่น สไตล์โฮมเมด)

ข้อมูลสำคัญของร้าน:
1. ชื่อร้าน: มานี มีถ้วย คาเฟ่ (Manee Mee Thuay Cafe)
2. สโลแกน: "ทุกหยดคือความใส่ใจ ทุกถ้วยคือเรื่องราว"
3. คอนเซปต์ร้าน: เป็นร้านกาแฟสีน้ำตาลนวลตา บรรยากาศอบอุ่นโฮมเมด ที่ผสาน "รสชาติกาแฟ" เข้ากับ "ศิลปะดินเผาทำมือ" โดยลูกค้าสามารถเลือกสไตล์ถ้วยเซรามิกหรือดินเผาใบโปรดที่จะเสิร์ฟเครื่องดื่มชิ้นโปรดได้ตามต้องการ
4. เมนูแนะนำ (Signature Menu):
   - มานี เอสเปรสโซ่ (Manee Espresso) - ราคา 65 บาท: เอสเปรสโซ่เข้มข้น ผสานครีมนมสูตรลับ เสิร์ฟร้อนในถ้วยดินเผา
   - ชาไทยละมุนถ้วย (Creamy Thai Tea) - ราคา 60 บาท: ชาไทยเบลนด์ต้มสด ท็อปฟองนมนุ่มและคาราเมลโฮมเมด
   - กาแฟมะพร้าวน้ำหอม (Coconut Cold Brew) - ราคา 75 บาท: กาแฟสกัดเย็นผสมน้ำมะพร้าวน้ำหอมแท้ออร์แกนิก สดชื่น
   - ขนมครกใบเตยโบราณ (Pandan Sweet Cup) - ราคา 45 บาท: ขนมครกสิงคโปร์ใบเตยแท้ หอมกะทิสด ทานร้อนๆ คู่กับกาแฟ
5. โปรโมชั่น: แอดไลน์ร้านแอดไลน์นี้ https://lin.ee/tWdmBoa รับคูปองส่วนลด 10% สำหรับสั่งซื้อเครื่องดื่มแก้วแรกทันที!
6. วิธีการสั่งซื้อ / จองโต๊ะ: สามารถสั่งซื้อแบบเดลิเวอรี่ หรือสั่งล่วงหน้า และจองโต๊ะผ่าน LINE: https://lin.ee/tWdmBoa (Line ID: @maneemeethuay)
7. สถานที่ตั้ง: 101 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110 (เข้าซอยสุขุมวิท 101 เมตร)
8. เวลาทำการ:
   - วันจันทร์ - ศุกร์: 07:30 น. - 17:00 น.
   - วันเสาร์ - อาทิตย์: 08:30 น. - 18:00 น.
9. ติดต่อ: โทร. 081-234-5678, อีเมล hello@maneemeethuay.cafe

แนวทางการตอบคำถาม:
- ตอบคำถามลูกค้าสั้นกระชับ อบอุ่น และสุภาพ
- หากลูกค้าถามเรื่องราคาหรือเมนู ให้แนะนำเมนูซิกเนเจอร์ด้านบน
- สนับสนุนให้ลูกค้ากดลิงก์แอดไลน์เพื่อสั่งอาหารหรือจองถ้วยแบบเฉพาะตัวเสมอ
- ห้ามตอบคำถามอื่นที่ไม่เกี่ยวข้องกับร้าน หรือเรื่องที่เป็นความรู้ทั่วไปมากเกินไป ให้ดึงกลับมาเรื่องกาแฟและร้านมานีมีถ้วยอย่างสุภาพ
`;

// API endpoint to proxy chatbot request to OpenRouter API
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
        return res.status(500).json({
            error: 'ขออภัย ระบบแชทบอทยังไม่ได้ติดตั้ง OpenRouter API Key กรุณาติดตั้งในไฟล์ .env ก่อนใช้งานค่ะ'
        });
    }

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Construct messages array in OpenAI/OpenRouter format
        const messages = [
            { role: 'system', content: SYSTEM_INSTRUCTION }
        ];

        // Format and append chat history
        if (history && Array.isArray(history)) {
            history.forEach(item => {
                messages.push({
                    role: item.role === 'user' ? 'user' : 'assistant',
                    content: item.text
                });
            });
        }

        // Add current user message
        messages.push({
            role: 'user',
            content: message
        });

        const requestBody = {
            model: 'google/gemini-3.5-flash',
            messages: messages,
            temperature: 0.7,
            max_tokens: 800
        };

        const response = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'Manee Mee Thuay Cafe'
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errData = await response.json();
            console.error('OpenRouter API Error:', errData);
            return res.status(502).json({
                error: 'ระบบตอบกลับขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งนะคะ'
            });
        }

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const aiReply = data.choices[0].message.content;
            return res.json({ reply: aiReply });
        } else {
            console.error('Unexpected OpenRouter response:', data);
            return res.status(500).json({
                error: 'ไม่สามารถประมวลผลคำตอบได้ กรุณาลองใหม่อีกครั้งค่ะ'
            });
        }

    } catch (error) {
        console.error('Server error during chat request:', error);
        return res.status(500).json({
            error: 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้งค่ะ'
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Manee Mee Thuay Cafe Server is running on port ${PORT}`);
    console.log(` Open http://localhost:${PORT} in your browser`);
    console.log(`==================================================`);
});
