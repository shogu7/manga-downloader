
# Manga Downloader from Mangadex API

This project contains a collection of simple scripts for downloading manga chapters from Mangadex using their API and respecting their request limit.

## Notes

- Make sure to modify the script variables (like `mangaId`, `chapterNumber`, etc.) before running.
- Scripts handle rate-limiting automatically to avoid API request issues.

## Scripts

1. **`dl_check_chapter.js`**  
   Verifies if the specified folder contains the correct number of subfolders (useful for organizing downloaded manga).

   **How to use**:  
   ```bash
   node dl_check_chapter.js
   ```

2. **`dl_mangadex_chapter.js`**  
   Downloads a specified manga chapter in the selected language.

   **How to use**:  
   ```bash
   node dl_mangadex_chapter.js
   ```

   Make sure to set the `mangaId` and `chapterNumber` before running the script.

3. **`mangadex_dl.js`**  
   Downloads all chapters of a manga in the chosen language.

   **How to use**:  
   ```bash
   node mangadex_dl.js
   ```

   Update the script with the `mangaId` and `language` you prefer.

4. **`nb_chap_output.js`**  
   Makes an API call to fetch the number of available chapters in a specified language.

   **How to use**:  
   ```bash
   node nb_chap_output.js
   ```

   Modify the `mangaId` and `language` in the script to get the chapter count.

5. **`chap_info.js`**  
   Retrieves detailed information about a specific chapter (e.g., title, language, and translation group).

   **How to use**:  
   ```bash
   node chap_info.js
   ```

   Set the `chapterId` in the script to retrieve details for a specific chapter.
