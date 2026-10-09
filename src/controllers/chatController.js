const chat = async (req, res) => {
    try {
        const { messages, userText } = req.body;
        
        if (!userText) {
            return res.status(400).json({ message: "Text is required" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        
        const apiMessages = [
            {
                role: 'system',
                content: `You are Cliffhanger Kids Style Assistant, the friendly AI for a premium Pakistani kids denim brand.
                Target audience: Pakistani parents shopping for kids aged 2–14 years.
                Speak in a helpful, respectful, and natural mix of Roman Urdu and English.
                Your goal: Help parents with size recommendations, best-selling products, outfit suggestions, and explain our Easy Exchange and Cash on Delivery policies.
                Brand: Cliffhanger The Jeans (Premium quality, stretch fabric, durable, comfortable).
                Keep answers concise and friendly.`
            },
            ...(messages || []),
            { role: 'user', content: userText }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: apiMessages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices.length > 0) {
            res.json({ reply: data.choices[0].message.content });
        } else {
            console.error("Groq API Error:", data);
            res.status(500).json({ 
                message: "No response from Groq",
                error: data.error || data 
            });
        }
    } catch (error) {
        console.error('Error fetching bot response:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const recommend = async (req, res) => {
    try {
        const { userText } = req.body;
        
        if (!userText) {
            return res.status(400).json({ message: "Text is required" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        
        const apiMessages = [
            {
                role: 'system',
                content: `You are the AI Denim Matchmaker for Cliffhanger Jeans. 
                Your job is to recommend the best category of jeans based on the user's input.
                Available categories:
                - Boys (Rugged, durable, adventurous)
                - Girls (Comfortable, stylish, adventure-ready)
                - New Arrivals (Latest trends)
                - Sale (Discounted items)
                
                Respond in valid JSON format ONLY with the following structure:
                {
                    "advice": "A brief, friendly styling advice (max 2 sentences)",
                    "categoryName": "The suggested category name",
                    "categoryUrl": "/boys OR /girls OR /new-arrivals OR /sale"
                }`
            },
            { role: 'user', content: userText }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: apiMessages,
                max_tokens: 300,
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices.length > 0) {
            const result = JSON.parse(data.choices[0].message.content);
            res.json(result);
        } else {
            console.error("Groq API Error:", data);
            res.status(500).json({ 
                message: "No response from Groq",
                error: data.error || data 
            });
        }
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const sizeRecommendation = async (req, res) => {
    try {
        const { age, height, weight } = req.body;
        
        if (!age || !height || !weight) {
            return res.status(400).json({ message: "Age, height, and weight are required" });
        }

        const apiKey = process.env.GROQ_API_KEY;
        
        const apiMessages = [
            {
                role: 'system',
                content: `You are a Kids Denim Size Expert for Cliffhanger The Jeans (a premium Pakistani brand). 
                Given the child's age, height (cm), and weight (kg), recommend the best jeans size (e.g., "5-6 Years", "7-8 Years", etc.).
                Respond ONLY in valid JSON format with the following structure:
                {
                    "size": "The recommended size",
                    "confidence": "A percentage like '95%'",
                    "explanation": "A simple, friendly explanation for parents in English/Roman Urdu."
                }`
            },
            { role: 'user', content: `Age: ${age}, Height: ${height}cm, Weight: ${weight}kg` }
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: apiMessages,
                max_tokens: 200,
                temperature: 0.2,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices.length > 0) {
            const result = JSON.parse(data.choices[0].message.content);
            res.json(result);
        } else {
            console.error("Groq API Error:", data);
            res.status(500).json({ message: "No response from Groq" });
        }
    } catch (error) {
        console.error('Error fetching size recommendation:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    chat,
    recommend,
    sizeRecommendation
};
