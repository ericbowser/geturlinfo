import * as cheerio from 'cheerio'; // Use * as for CommonJS module
import * as fs from 'fs'; // Use * as for CommonJS module
import {promises as fsPromises} from 'fs'; // Import promises API for async/await
import {exec} from 'child_process';
import axios from 'axios'; // axios is typically default export
import * as path from 'path'; // Use * as for CommonJS module
import {URL} from 'url'; // Node.js built-in URL class for robust URL parsing
import {promisify} from 'util'; // For promisifying exec

// Promisify exec for async/await usage
const execPromise = promisify(exec);

// Define the directory and file path
const htmlDir = path.join(__dirname, 'html');
const filePath = path.join(htmlDir, 'scraped.txt');

// Ensure the 'html' directory exists, create it if it doesn't
// This should ideally be done once at application startup or before the first write.
// Placing it here means it runs every time the module is imported, which is fine for a small app.
try {
    if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, {recursive: true});
        console.log(`Created directory: ${htmlDir}`);
    }
} catch (err: any) {
    console.error(`Error creating directory ${htmlDir}:`, err.message);
    // Depending on the application, you might want to throw an error here
    // or handle it in a way that prevents the script from proceeding if the dir is essential.
}

/**
 * Validates if a given string is a well-formed URL.
 * @param url The string to validate.
 * @returns True if the string is a valid URL, false otherwise.
 */
function isValidUrl(url: string): boolean {
    if (typeof url !== 'string' || url.trim() === '') {
        return false;
    }
    try {
        // Use Node.js's URL constructor for robust validation
        new URL(url);
        // Optional: Add your regex for stricter protocol/domain validation if needed
        const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return urlPattern.test(url);
    } catch (_) {
        return false; // URL constructor throws for invalid URLs
    }
}

/**
 * Fetches the HTML content of a given URL.
 * @param url The URL to fetch.
 * @returns A Promise that resolves to the HTML content as a string, or null if the URL is invalid.
 * @throws If the HTTP request fails.
 */
async function fetchPage(url: string): Promise<string | null> {
    try {
        if (!isValidUrl(url)) {
            console.error('Invalid URL provided to fetchPage:', url);
            return null;
        }
        const response = await axios.get(url, {responseType: 'text'});
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching page ${url}: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        }
        throw error; // Re-throw to be handled by the caller (getUrlInfo)
    }
}

/**
 * Writes content to a file and attempts to open it.
 * Uses fs.promises for proper async/await.
 * @param filePath The path to the file.
 * @param fileContent The content to write.
 */
async function writeAndOpenFile(filePath: string, fileContent: string): Promise<void> {
    try {
        await fsPromises.writeFile(filePath, fileContent, 'utf-8');
        console.log('File written successfully:', filePath);

        const openCmd: string = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
        // Enclose filePath in quotes to handle spaces in file paths
        await execPromise(`${openCmd} "${filePath}"`);
        console.log('Attempted to open file:', filePath);
    } catch (error: any) {
        console.error(`Error in writeAndOpenFile for ${filePath}:`, error.message);
        // Decide if this error should stop the main flow or just be logged.
        // For now, we'll log it but not re-throw to allow getUrlInfo to complete.
    }
}

/**
 * Deletes a file if it exists.
 * Uses fs.promises for proper async/await.
 * @param filePath The path to the file to delete.
 */
async function deleteFileIfExists(filePath: string): Promise<void> {
    try {
        // Check existence using fsPromises.access (throws if not found)
        await fsPromises.access(filePath, fs.constants.F_OK); // F_OK checks existence
        // If access doesn't throw, the file exists.
        await fsPromises.unlink(filePath);
        console.log('File deleted successfully:', filePath);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.log('File not found, skipping deletion:', filePath);
        } else {
            console.error(`Error deleting file ${filePath}:`, error.message);
            // Re-throw other errors if they are critical
            throw error;
        }
    }
}

/**
 * Extracts all href attributes from <a> tags.
 * @param doc The CheerioAPI object.
 * @param baseUrl The base URL to resolve relative links.
 * @returns An array of absolute URLs.
 */
const extractLinks = (doc: cheerio.CheerioAPI, baseUrl: string): string[] => {
    const links = new Set<string>(); // Use a Set to automatically handle duplicates
    doc('a').each((i, element) => {
        const href = doc(element).attr('href');
        if (href) {
            try {
                // Resolve relative URLs to absolute URLs
                const absoluteUrl = new URL(href, baseUrl).href;
                links.add(absoluteUrl);
            } catch (e) {
                // console.warn(`Invalid href found or could not resolve: ${href}`);
            }
        }
    });
    return Array.from(links);
};

/**
 * Extracts text content from specified HTML elements.
 * @param doc The CheerioAPI object.
 * @param selector The CSS selector for the elements (e.g., 'h1', 'p', 'li').
 * @returns An array of trimmed text content.
 */
function extractTextBySelector(doc: cheerio.CheerioAPI, selector: string): string[] {
    const texts: string[] = [];
    doc(selector).each((i, element) => {
        const text = doc(element).text().trim();
        if (text) {
            texts.push(text);
        }
    });
    return texts;
}

/**
 * Main function to get information from a URL, scrape content, and save to a file.
 * @param url The URL to scrape.
 * @returns A structured object containing scraped links, titles, paragraphs, and list items.
 */
export async function getUrlInfo(url: string): Promise<{
    sourceUrl: string;
    links: string[];
    titles: string[];
    paragraphs: string[];
    listItems: string[];
    error?: string;
} | null> {
    if (!url) {
        console.error('URL is required for getUrlInfo.');
        return null;
    }
    if (!isValidUrl(url)) {
        console.error('Invalid URL provided to getUrlInfo:', url);
        return null;
    }

    console.log(`Starting to process URL: ${url}`);

    try {
        const htmlString = await fetchPage(url);

        if (!htmlString || htmlString.length === 0) {
            console.log('HTML content not found or empty for URL:', url);
            return {
                sourceUrl: url,
                error: 'No content fetched',
                links: [],
                titles: [],
                paragraphs: [],
                listItems: [],
            };
        }

        // cheerio.load is synchronous, no need for await here
        const doc = cheerio.load(htmlString);
        console.log('HTML parsed successfully for:', url);

        const baseUrl = new URL(url).origin; // Get the origin for resolving relative links

        const links = extractLinks(doc, baseUrl);
        const titlesH1 = extractTextBySelector(doc, 'h1');
        const titlesH2 = extractTextBySelector(doc, 'h2');
        const titlesH3 = extractTextBySelector(doc, 'h3');
        const paragraphs = extractTextBySelector(doc, 'p');
        const listItems = extractTextBySelector(doc, 'li'); // Gets all li text, regardless of ul/ol

        const allTitles = [...titlesH1, ...titlesH2, ...titlesH3];

        // Prepare content for the file output
        const fileOutputSections: string[] = [
            `--- SOURCE URL ---`,
            url,
            '', // Empty line for spacing
            `--- LINKS (${links.length}) ---`,
            ...links,
            '',
            `--- TITLES (${allTitles.length}) ---`,
            ...allTitles,
            '',
            `--- PARAGRAPHS (${paragraphs.length}) ---`,
            ...paragraphs,
            '',
            `--- LIST ITEMS (${listItems.length}) ---`,
            ...listItems,
        ];
        const fileContent = fileOutputSections.join('\r\n');

        // Perform file operations using the modern async functions
        await deleteFileIfExists(filePath);
        await writeAndOpenFile(filePath, fileContent);

        // Return a structured object with all collected data
        const result = {
            sourceUrl: url,
            links,
            titles: allTitles,
            paragraphs,
            listItems,
        };

        console.log(`Successfully processed URL: ${url}. Found ${links.length} links, ${allTitles.length} titles.`);
        return result;

    } catch (error: any) {
        console.error(`An error occurred in getUrlInfo for URL ${url}: ${error.message}`);
        // Return a structured error object or null, depending on desired behavior
        return {
            sourceUrl: url,
            error: error.message,
            links: [],
            titles: [],
            paragraphs: [],
            listItems: [],
        };
    }
}

module.exports = getUrlInfo;