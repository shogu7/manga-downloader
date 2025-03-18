const axios = require('axios');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getChapterInfo(chapterId) {
  const url = `https://api.mangadex.org/chapter/${chapterId}`;

  try {
    const response = await axios.get(url);
    const chapter = response.data.data;

    if (!chapter) {
      console.log(`Aucun chapitre trouvé avec l'ID ${chapterId}`);
      return;
    }

    console.log(`Chapter ID: ${chapterId}`);
    console.log(`Language: ${chapter.attributes.translatedLanguage}`);
    console.log(`Title: ${chapter.attributes.title}`);
    console.log(`Publication date: ${chapter.attributes.publishAt}`);
    console.log(`Translate by: ${chapter.relationships.map(r => r.attributes.name).join(", ")}`);

    console.log("Full chapter details:", JSON.stringify(chapter, null, 2));

  } catch (error) {
    console.error(`Error retrieving the chapter with ID ${chapterId}:`, error.message);
  }
}

async function getMultipleChaptersInfo(chapterIds) {
  for (let i = 0; i < chapterIds.length; i++) {
    await getChapterInfo(chapterIds[i]);
    if (i < chapterIds.length - 1) {
      await sleep(200);  
    }
  }
}

// Example usage: provide an array of chapter IDs to check.
const chapterIds = [
  '3fbd4ecf-30d2-4e25-ae5b-c2c6802d679b', // Replace these IDs with the chapters you want to test.
  'b9ac8b62-0b60-4676-b7f2-8d85c476ab7a',
  '82e30f29-89fa-4380-b0d0-081d9b0a74c3',
  '543ac8d3-2ccf-4e55-9a7f-59244e2d9a4a',
  'd15f1e3b-23c9-48b9-b53e-e3b6a6f0419a'
];

getMultipleChaptersInfo(chapterIds);

// Retrieves information about a specific chapter.