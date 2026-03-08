const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('ffmpeg-static');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller);

const inputPath = path.join(__dirname, 'public', 'bg-login.mp4');
const outputPath = path.join(__dirname, 'public', 'bg-login-converted.mp4');

console.log('Starting conversion of', inputPath);

ffmpeg(inputPath)
    .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-b:v 2000k', // Compress a bit to load faster on the web
        '-an' // Remove audio since the background video is moot
    ])
    .save(outputPath)
    .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent ? progress.percent.toFixed(1) : progress.targetSize} % done`);
    })
    .on('end', () => {
        console.log('Conversion finished successfully! You can now use bg-login-converted.mp4');
    })
    .on('error', (err) => {
        console.error('Error during conversion:', err.message);
    });
