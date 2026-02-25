import request from 'supertest';
import { createApp } from '../src/app.js';
import { Proxy } from '../src/proxy.js';
import { jest } from '@jest/globals';
import fs from 'fs/promises';

describe('API', () => {
  let app;
  afterEach(() => {
    jest.restoreAllMocks();
    if (app && app.stop) {
      app.stop();
    }
  });

  it('should accept a message and launch the CLI', async () => {
    // We'll mock Proxy to avoid actually running the CLI in this test
    const mockRun = jest.fn().mockResolvedValue('Response from gemini cli');
    const mockProxy = { run: mockRun };
    app = createApp({ proxy: mockProxy });

    const response = await request(app)
      .post('/message')
      .send({ content: 'Hello Gemini!' });

    expect(response.status).toBe(200);
    expect(response.body.response).toBe('Response from gemini cli');
  });

  it('should return 400 if content is missing in /message', async () => {
    app = createApp({ proxy: {} });
    const response = await request(app)
      .post('/message')
      .send({});
    expect(response.status).toBe(400);
  });

  it('should return 500 if proxy fails in /message', async () => {
    const mockProxy = { run: jest.fn().mockRejectedValue(new Error('Proxy error')) };
    app = createApp({ proxy: mockProxy });
    const response = await request(app)
      .post('/message')
      .send({ content: 'fail' });
    expect(response.status).toBe(500);
  });

  it('should accept a file and save it', async () => {
    app = createApp({ proxy: {} });
    const response = await request(app)
      .post('/files')
      .send({ name: 'test.md', content: '# Hello' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should return 400 if name or content is missing in /files', async () => {
    app = createApp({ proxy: {} });
    const response = await request(app)
      .post('/files')
      .send({ name: 'test.md' });
    expect(response.status).toBe(400);
  });

  it('should return 403 for invalid file path in /files', async () => {
    app = createApp({ proxy: {} });
    const response = await request(app)
      .post('/files')
      .send({ name: '../test.md', content: 'hack' });
    expect(response.status).toBe(403);
  });

  it('should return 500 if file write fails in /files', async () => {
    jest.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Write error'));
    app = createApp({ proxy: {} });
    const response = await request(app)
      .post('/files')
      .send({ name: 'test.md', content: 'hello' });
    expect(response.status).toBe(500);
  });

  it('should schedule and execute a cron job', async () => {
    const mockProxy = { run: jest.fn().mockResolvedValue('ok') };
    let capturedCallback;
    const cron = (await import('node-cron')).default;
    jest.spyOn(cron, 'schedule').mockImplementation((sched, cb) => {
      capturedCallback = cb;
      return { stop: jest.fn() };
    });

    app = createApp({ proxy: mockProxy });
    const response = await request(app)
      .post('/cron')
      .send({ schedule: '* * * * *', message: 'Tick' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Manually trigger the callback
    await capturedCallback();
    expect(mockProxy.run).toHaveBeenCalledWith(['--yolo', '-p', 'Tick']);
  });

  it('should handle failure in cron job execution', async () => {
    const mockProxy = { run: jest.fn().mockRejectedValue(new Error('Cron fail')) };
    let capturedCallback;
    const cron = (await import('node-cron')).default;
    jest.spyOn(cron, 'schedule').mockImplementation((sched, cb) => {
      capturedCallback = cb;
      return { stop: jest.fn() };
    });

    app = createApp({ proxy: mockProxy });
    await request(app)
      .post('/cron')
      .send({ schedule: '* * * * *', message: 'Tick' });

    // Manually trigger the callback and ensure it doesn't crash the server
    await capturedCallback();
    expect(mockProxy.run).toHaveBeenCalled();
  });

  it('should return 400 if schedule or message is missing in /cron', async () => {
    app = createApp({ proxy: {} });
    const response = await request(app)
      .post('/cron')
      .send({ schedule: '* * * * *' });
    expect(response.status).toBe(400);
  });

  it('should return 500 if cron scheduling fails', async () => {
    // This is hard to trigger unless we mock cron.schedule
    app = createApp({ proxy: {} });
    const response = await request(app)
      .post('/cron')
      .send({ schedule: 'invalid', message: 'Tick' });
    expect(response.status).toBe(500);
  });
});
