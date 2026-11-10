import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.model = this.configService.get<string>('OLLAMA_MODEL', 'llama3.2:3b');
  }

  private doGenerate(prompt: string): Promise<Response> {
    return fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          num_predict: 1024,
        },
      }),
    });
  }

  private async pullModel(): Promise<void> {
    this.logger.log(`Model '${this.model}' not found — pulling, this may take several minutes...`);
    const res = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: this.model }),
    });
    if (!res.ok) {
      throw new Error(`Failed to pull model '${this.model}': ${await res.text()}`);
    }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const line = decoder.decode(value, { stream: true }).trim();
      if (line) {
        try {
          const status = JSON.parse(line) as { status?: string };
          if (status.status) this.logger.log(`pull: ${status.status}`);
        } catch { /* partial chunk */ }
      }
    }
    this.logger.log(`Model '${this.model}' pulled successfully`);
  }

  async generateJson<T>(prompt: string): Promise<T> {
    let res = await this.doGenerate(prompt);

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 404 && body.includes('not found')) {
        await this.pullModel();
        res = await this.doGenerate(prompt);
        if (!res.ok) {
          throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
        }
      } else {
        throw new Error(`Ollama error ${res.status}: ${body}`);
      }
    }

    const data = await res.json();
    this.logger.debug(`Ollama raw: ${data.response?.substring(0, 200)}`);

    try {
      return JSON.parse(data.response) as T;
    } catch {
      throw new Error(`JSON inválido de Ollama: ${data.response?.substring(0, 300)}`);
    }
  }
}
