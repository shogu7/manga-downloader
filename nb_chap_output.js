const axios = require('axios');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAllChapters(mangaId) {
  let allChapters = [];
  let offset = 0;
  const limit = 100; 

  while (true) {
    const feedUrl = `https://api.mangadex.org/manga/${mangaId}/feed?includeFuturePublishAt=0&limit=${limit}&offset=${offset}`;
    console.log(`Request for offset=${offset}: ${feedUrl}`);
    const response = await axios.get(feedUrl);
    const chapters = response.data.data;

    if (!chapters || chapters.length === 0) {
      break;
    }

    allChapters = allChapters.concat(chapters);

    if (chapters.length < limit) {
      break;
    }

    offset += limit;
    await sleep(500);
  }

  return allChapters;
}

async function countChaptersInLanguage(mangaId) {
  const allChapters = await getAllChapters(mangaId);

  if (!allChapters || allChapters.length === 0) {
    console.log('No chapter found.');
    return;
  }

  allChapters.forEach((chapter, index) => {
    console.log(`Chapter ${index + 1} - Langue: ${chapter.attributes.translatedLanguage}`);
  });

  const filteredChapters = allChapters.filter(chapter => 
    language.some(lang => 
      chapter.attributes.translatedLanguage.toLowerCase().includes(lang.toLowerCase())
    )
  );

  console.log(`Number of total chapter : ${allChapters.length}`);
  console.log(`Number of chapter in ${language.join(", ")}: ${filteredChapters.length}`);

  return filteredChapters.length;
}


// const language = ["en", "English", "en-US", "eng", "english", "en_GB", "en-GB", "england", "anglo", "english_us", "english-usa", "english-us"];
const language = ["Français", "FR", "french", "fr", "French", "francais", "français", "fr-FR", "fra", "francophone", "frances", "french-fr", "french_fr", "francais_fr", "fr_FR"]; 
const mangaId = '8b34f37a-0181-4f0b-8ce3-01217e9a602c'; // The ID of the manga you want to dl. Find it on the URL page of the Manga.
countChaptersInLanguage(mangaId)
  .then(chapterCount => console.log(`Number of chapter find: ${chapterCount}`))
  .catch(err => console.error("Erreur:", err));

// Makes an API call to retrieve the number of available chapters based on the language.