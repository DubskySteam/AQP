var speech_example4_options = {
    lang: 'de-DE',
    startword: 'Computer',
    sources: [{
            url: 'https://api.openai.com/v1/chat/completions',
            auth: 'Bearer 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',
            method: 'POST',
            body: '{"messages": [{"role": "user", "content": "%words%"}],"temperature": 0.6, "model": "gpt-3.5-turbo"}',
            jpath: 'choices/0/message/content'
        }]
};