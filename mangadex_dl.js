const axios = require('axios');
const fs = require('fs');
const path = require('path');

let requestTimestamps = [];

async function requestWithRateLimit(requestFunction) {
    const now = Date.now();

    requestTimestamps = requestTimestamps.filter(ts => now - ts < 1000);

    if (requestTimestamps.length >= 5) {
        const waitTime = 1000 - (now - requestTimestamps[0]); 
        console.log(`Rate limit reached, waiting for ${waitTime} ms...`);
        await sleep(waitTime);
    }

    requestTimestamps.push(Date.now());

    return await requestFunction();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(url, filePath) {
    const writer = fs.createWriteStream(filePath);

    const response = await requestWithRateLimit(() =>
        axios.get(url, { responseType: 'stream' })
    );

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function downloadChapterImages(chapterId, chapterNumber) {
    const url = `https://api.mangadex.org/at-home/server/${chapterId}`;

    const response = await requestWithRateLimit(() => axios.get(url));
    
    if (response.status === 200) {
        const data = response.data;
        const baseUrl = data.baseUrl;
        const chapterHash = data.chapter.hash;
        const dataFiles = data.chapter.data;

        if (!baseUrl || !chapterHash || !dataFiles) {
            console.error(`Invalid data for chapter ${chapterId}`);
            return;
        }

        const chapterFolder = path.join(__dirname, 'mangas', title, chapterNumber.toString());
        if (!fs.existsSync(chapterFolder)) {
            fs.mkdirSync(chapterFolder, { recursive: true });
        }

        for (let i = 0; i < dataFiles.length; i++) {
            const imageUrl = `${baseUrl}/data/${chapterHash}/${dataFiles[i]}`;
            const fileName = `page_${i + 1}.jpg`;
            const filePath = path.join(chapterFolder, fileName);
            
            console.log(`Downloading ${imageUrl}`);
            try {
                await downloadImage(imageUrl, filePath);
                console.log(`Page ${i + 1} downloaded.`);
            } catch (error) {
                console.error(`Error downloading ${imageUrl}: ${error.message}`);
            }
        }
    } else {
        console.error(`API error for chapter ${chapterId}: ${response.status}`);
    }
}

async function getAllChapters(mangaId) {
    let allChapters = [];
    let offset = 0;
    const limit = 100;

    while (true) {
        const feedUrl = `https://api.mangadex.org/manga/${mangaId}/feed?includeFuturePublishAt=0&limit=${limit}&offset=${offset}`;

        console.log(`Request for offset=${offset}: ${feedUrl}`);

        const response = await requestWithRateLimit(() => axios.get(feedUrl));

        const chapters = response.data.data;

        if (!chapters || chapters.length === 0) {
            break;
        }

        allChapters = allChapters.concat(chapters);

        if (chapters.length < limit) {
            break;
        }

        offset += limit;
    }

    return allChapters;
}

async function downloadAllChapters(mangaId) {
    const allChapters = await getAllChapters(mangaId);

    if (!allChapters || allChapters.length === 0) {
        console.log('No chapters found.');
        return;
    }

    const frenchChapters = allChapters.filter(chapter => 
        language.some(lang => 
            chapter.attributes.translatedLanguage.toLowerCase().includes(lang.toLowerCase())
        )
    );

    console.log(`Number of chapters found: ${frenchChapters.length}`);

    for (let i = 0; i < frenchChapters.length; i++) {
        const chapter = frenchChapters[i];
        const chapterNumber = chapter.attributes.chapter;
        
        console.log(`\nDownloading chapter ${chapterNumber} (ID: ${chapter.id})`);

        await downloadChapterImages(chapter.id, chapterNumber);
    }

    console.log('All chapters have been downloaded successfully!');
}


const title = "Scan Name";  // Title of the manga
const language = ["Français", "FR", "french", "fr", "French", "francais", "français", "fr-FR", "fra"]; //  you can make ur owns list for other language if you want
// const language = ["en", "English", "en-US", "eng", "english", "en_GB", "en-GB", "england", "anglo", "english_us", "english-usa", "english-us"];
const mangaId = '141609b6-cf86-4266-904c-6648f389cdc9'; // The ID of the manga you want to dl. Find it on the URL page of the Manga.

downloadAllChapters(mangaId)
    .then(() => console.log("Task Completed"))
    .catch(err => console.error("Erreur:", err));

// Dowload all chapter from a scan with a specific language