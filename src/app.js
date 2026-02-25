import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';

export function createApp({ proxy }) {
  const app = express();
  app.use(express.json());
  const activeJobs = [];

  app.post('/message', async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Missing content' });
      }

      // Add --yolo and -p to automate
      const response = await proxy.run(['--yolo', '-p', content]);
      res.json({ response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  app.post('/files', async (req, res) => {
    try {
      const { name, content } = req.body;
      if (!name || !content) {
        return res.status(400).json({ error: 'Missing name or content' });
      }

      const filePath = path.join(process.cwd(), name);
      // Security: ensure name doesn't go outside cwd
      if (!filePath.startsWith(process.cwd())) {
        return res.status(403).json({ error: 'Invalid file path' });
      }

      await fs.writeFile(filePath, content);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  app.post('/cron', (req, res) => {
    try {
      const { schedule, message } = req.body;
      if (!schedule || !message) {
        return res.status(400).json({ error: 'Missing schedule or message' });
      }

      const job = cron.schedule(schedule, async () => {
        console.log(`Running scheduled task: ${message}`);
        try {
          await proxy.run(['--yolo', '-p', message]);
        } catch (error) {
          console.error('Cron job failed:', error);
        }
      });
      activeJobs.push(job);

      res.json({ success: true, schedule });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  app.stop = () => {
    activeJobs.forEach(job => job.stop());
  };

  return app;
}
