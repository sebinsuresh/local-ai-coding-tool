import { AIRequest, AIResponse } from '../types/api';
import { AppConfig } from '../types/state';

export class APIClient {
    private config: AppConfig | null = null;

    public configure(config: AppConfig): void {
        this.config = config;
    }

    public async sendRequest(request: AIRequest): Promise<AIResponse> {
        if (!this.config || !this.config.apiKey || !this.config.apiEndpoint) {
            return { modifiedCode: '', error: 'API not configured. Please set endpoint and key in settings.' };
        }

        const prompt = `
Original code:
\`\`\`
${request.codeContext}
\`\`\`

Instruction: ${request.instruction}

Identify the code above and apply the instruction. 
Return ONLY the modified code. No explanations, no markdown blocks, just the code.`;

        try {
            const response = await fetch(`${this.config.apiEndpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [
                        { role: 'system', content: 'You are a professional code editor assistant. You only output code.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { modifiedCode: '', error: errorData.error?.message || 'API request failed' };
            }

            const data = await response.json();
            const modifiedCode = data.choices[0]?.message?.content || '';
            
            return { modifiedCode: modifiedCode.trim() };
        } catch (error) {
            console.error('AI Request Error:', error);
            return { modifiedCode: '', error: error instanceof Error ? error.message : 'Unknown error occurred' };
        }
    }
}
