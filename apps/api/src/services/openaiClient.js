const OpenAI = require('openai');

/**
 * Cliente de OpenAI con configuración y retry logic
 */
class OpenAIClient {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.defaultModel = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    this.maxRetries = 3;
  }

  /**
   * Ejecuta una completion con retry logic
   */
  async complete(messages, options = {}) {
    const {
      model = this.defaultModel,
      temperature = 0.3,
      maxTokens = 500,
      responseFormat = { type: 'json_object' }
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: responseFormat,
        });

        return {
          content: response.choices[0].message.content,
          usage: response.usage,
          model: response.model,
        };
      } catch (error) {
        lastError = error;
        console.error(`OpenAI attempt ${attempt} failed:`, error.message);
        
        // No reintentar en errores de autenticación o quota
        if (error.status === 401 || error.status === 429) {
          throw error;
        }
        
        // Esperar antes de reintentar (exponential backoff)
        if (attempt < this.maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Helper para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica que la API key esté configurada
   */
  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }
}

module.exports = new OpenAIClient();
