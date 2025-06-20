const express = require('express');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/download', async (req, res) => {
    const videoURL = req.body.url;

    if (!videoURL || !videoURL.startsWith('http')) {
        return res.status(400).send("❌ URL Youtube tidak valid.");
    }

    try {
        const info = await youtubedl(videoURL, {
            dumpSingleJson: true
        });

        const title = info.title.replace(/[\/\\?%*:|"<>]/g, '-');
        const filename = `${uuidv4()}.mp4`;
        const filepath = path.join(__dirname, filename);

        await youtubedl(videoURL, {
            output: filepath,
            format: 'mp4'
        });

        res.download(filepath, `${title}.mp4`, (err) => {
            if (err) console.error("❌ Error saat kirim file:", err);
            fs.unlink(filepath, () => {}); // Hapus file setelah dikirim
        });

    } catch (err) {
        console.error("❌ Gagal:", err);
        res.status(500).send("❌ Gagal mengunduh video.");
    }
});

app.listen(port, () => {
    console.log(`🚀 Server jalan di http://localhost:${port}`);
});
