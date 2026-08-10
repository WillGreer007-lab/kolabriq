import { createClient } from '@supabase/supabase-js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Tell fluent-ffmpeg where the binary is
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Load environment variables for the worker
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Worker Error: Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🎬 Kolabriq Real Video Processing Worker Started...");

async function processVideo(job: any) {
  const { file_path } = job;
  console.log(`\n⏳ Processing job ${job.id} for file ${file_path}...`);
  
  await supabase.from('video_jobs').update({ status: 'processing' }).eq('id', job.id);

  const tempDir = os.tmpdir();
  const inputFilePath = path.join(tempDir, `input_${job.id}.mp4`);
  const outputFilePath = path.join(tempDir, `output_${job.id}.mp4`);

  try {
    // 1. Download from Supabase
    console.log("⬇️ Downloading video from Supabase...");
    const { data: fileData, error: downloadError } = await supabase.storage.from('videos').download(file_path);
    if (downloadError) throw new Error(`Download failed: ${downloadError.message}`);
    
    const buffer = Buffer.from(await fileData.arrayBuffer());
    fs.writeFileSync(inputFilePath, buffer);
    console.log("✅ Download complete.");

    // 2. Compress via FFmpeg
    console.log("⚙️ Compressing video via FFmpeg (this may take a moment)...");
    await new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .outputOptions([
          '-c:v libx264',
          '-crf 28', // Good compression ratio
          '-preset fast', // Faster encoding
          '-c:a aac',
          '-b:a 128k'
        ])
        .save(outputFilePath)
        .on('end', () => resolve(true))
        .on('error', (err) => reject(err));
    });
    console.log("✅ Compression complete.");

    // 3. Upload back to Supabase
    console.log("⬆️ Uploading compressed video back to Supabase...");
    const compressedBuffer = fs.readFileSync(outputFilePath);
    const newFilePath = file_path.replace('.mp4', '_compressed.mp4');
    
    const { error: uploadError } = await supabase.storage.from('videos').upload(newFilePath, compressedBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });
    
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    console.log("✅ Upload complete.");

    // 4. Clean up and complete
    fs.unlinkSync(inputFilePath);
    fs.unlinkSync(outputFilePath);

    await supabase.from('video_jobs').update({ status: 'completed' }).eq('id', job.id);
    console.log(`🎉 Job ${job.id} fully completed!`);

  } catch (error: any) {
    console.error(`❌ Error processing job ${job.id}:`, error.message);
    await supabase.from('video_jobs').update({ status: 'failed' }).eq('id', job.id);
    
    // Clean up temp files if they exist
    if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
    if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
  }
}

async function pollQueue() {
  try {
    const { data: jobs, error } = await supabase
      .from('video_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (error && error.code !== '42P01') {
      console.error("Error polling queue:", error.message);
    }

    if (jobs && jobs.length > 0) {
      await processVideo(jobs[0]);
      // Check for next job immediately after finishing
      return pollQueue();
    }
  } catch (e) {
    // Ignore schema errors if table doesn't exist yet
  }

  // Poll again in 5 seconds if no jobs
  setTimeout(pollQueue, 5000);
}

// Start polling
pollQueue();
