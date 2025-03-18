const axios = require('axios');
const fs = require('fs');
const path = require('path');

const downloadBasePath = 'series folder';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadImage(url, filePath) {
  const writer = fs.createWriteStream(filePath);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function downloadChapterImages(chapterId, chapterNumber) {
  const url = `https://api.mangadex.org/at-home/server/${chapterId}`;
  const response = await axios.get(url);
  await sleep(200);

  if (response.status === 200) {
    const data = response.data;
    const baseUrl = data.baseUrl;
    const chapterHash = data.chapter.hash;
    const dataFiles = data.chapter.data;

    if (!baseUrl || !chapterHash || !dataFiles) {
      console.error(`Invalid data for chapter ${chapterId}`);
      return;
    }

    const chapterFolder = path.join(downloadBasePath, chapterNumber.toString());
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
      await sleep(200);
    }
  } else {
    console.error(`API call error for chapter ${chapterId}: ${response.status}`);
  }
}

async function getAllChapters(mangaId) {
  let allChapters = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const feedUrl = `https://api.mangadex.org/manga/${mangaId}/feed?includeFuturePublishAt=0&limit=${limit}&offset=${offset}`;
    console.log(`Request for offset=${offset}: ${feedUrl}`);
    
    try {
      const response = await axios.get(feedUrl);
      await sleep(200);
      const chapters = response.data.data;

      if (!chapters || chapters.length === 0) {
        break;
      }

      allChapters = allChapters.concat(chapters);

      if (chapters.length < limit) {
        break;
      }

      offset += limit;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.error(`Pagination stopped at offset=${offset} due to error 400.`);
        break;
      } else {
        console.error(`Error retrieving chapters at offset=${offset}: ${error.message}`);
        break;
      }
    }
  }

  return allChapters;
}

async function downloadChapterByNumber(mangaId, chapterNumber) {
  const allChapters = await getAllChapters(mangaId);

  if (!allChapters || allChapters.length === 0) {
    console.log('No chapters found.');
    return;
  }

  const chapter_language = allChapters.filter(chapter => 
    language.some(lang => 
      chapter.attributes.translatedLanguage.toLowerCase().includes(lang.toLowerCase())
    )
  );

  console.log(`Total number of chapters retrieved: ${allChapters.length}`);
  console.log("Available English chapters:", chapter_language.map(ch => ch.attributes.chapter));

  const chapterToDownload = chapter_language.find(chapter => {
    const num = parseFloat(chapter.attributes.chapter);
    return num === parseFloat(chapterNumber);
  });

  if (!chapterToDownload) {
    console.log(`Chapter ${chapterNumber} not found among the English chapters.`);
    return;
  }

  console.log(`Downloading chapter ${chapterNumber} (ID: ${chapterToDownload.id})...`);
  await downloadChapterImages(chapterToDownload.id, chapterNumber);
  console.log(`Chapter ${chapterNumber} download complete.`);
}

const mangaId = '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0'; // The ID of the manga you want to dl. Find it on the URL page of the Manga.
const language = ["Français", "FR", "french", "fr", "French", "francais", "français", "fr-FR", "fra", "francophone", "frances", "french-fr", "french_fr", "francais_fr", "fr_FR"];
// const language = ["en", "English", "en-US", "eng", "english", "en_GB", "en-GB", "england", "anglo", "english_us", "english-usa", "english-us", "UK"];
const chapterNumber = '132'; // The number of the chapter you wanna dl

downloadChapterByNumber(mangaId, chapterNumber)
  .then(() => console.log("Task Completed"))
  .catch(err => console.error("Erreur:", err));


// Downloads a specified chapter of a series with a specified language.