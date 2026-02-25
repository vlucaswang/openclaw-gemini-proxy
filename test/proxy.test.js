import { jest } from '@jest/globals';
import { Proxy } from '../src/proxy.js';

describe('Proxy', () => {
  it('should launch a command and capture output', async () => {
    const proxy = new Proxy({ command: 'echo', args: ['hello world'] });
    const output = await proxy.run();
    expect(output).toContain('hello world');
  });

  it('should reject when command fails', async () => {
    const proxy = new Proxy({ command: 'false' });
    await expect(proxy.run()).rejects.toThrow();
  });

  it('should use default values if none provided', () => {
    const proxy = new Proxy();
    expect(proxy.command).toBe('gemini');
    expect(proxy.args).toEqual([]);
    expect(proxy.cwd).toBe(process.cwd());
  });
});
