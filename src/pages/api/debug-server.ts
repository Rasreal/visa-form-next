import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import os from 'os';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Make sure we only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get server information
    const serverInfo = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + ' GB',
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)) + ' GB',
      uptime: Math.round(os.uptime() / 60 / 60) + ' hours',
      nodeVersion: process.version,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL ? 'true' : 'false',
      }
    };

    // Check temp directory
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
    const tempDirStatus = {
      path: tempDir,
      exists: false,
      isWritable: false,
      files: [] as string[],
    };

    // Check if temp directory exists
    if (fs.existsSync(tempDir)) {
      tempDirStatus.exists = true;

      // Try to write a test file
      const testFilePath = path.join(tempDir, `test-${Date.now()}.txt`);
      try {
        fs.writeFileSync(testFilePath, 'Test');
        tempDirStatus.isWritable = true;
        fs.unlinkSync(testFilePath); // Clean up test file
      } catch (error) {
        console.error('Cannot write to temp dir:', error);
      }

      // List files in temp directory
      try {
        tempDirStatus.files = fs.readdirSync(tempDir);
      } catch (error) {
        console.error('Cannot read temp dir:', error);
      }
    } else {
      // Try to create temp directory
      try {
        fs.mkdirSync(tempDir, { recursive: true });
        tempDirStatus.exists = true;
        
        // Test writing
        const testFilePath = path.join(tempDir, `test-${Date.now()}.txt`);
        fs.writeFileSync(testFilePath, 'Test');
        tempDirStatus.isWritable = true;
        fs.unlinkSync(testFilePath); // Clean up test file
        
        tempDirStatus.files = fs.readdirSync(tempDir);
      } catch (error) {
        console.error('Cannot create temp dir:', error);
      }
    }

    return res.status(200).json({
      success: true,
      serverInfo,
      tempDirStatus,
      headers: req.headers,
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug server error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 