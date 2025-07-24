const cheerio = require('cheerio');
const fs = require('fs');
const {exec} = require('child_process'); // Child process module to execute system commands
const {get} = require('axios');

// Function to validate URL format
function isValidUrl(url) {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!urlPattern.test(url);
}

async function fetchPage(url) {
    try {
        if (!isValidUrl(url)) {
            console.error('Invalid URL:', url);
            return null;
        }
        const {data} = await get(url, {responseType: 'text'});
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Write text to file
async function writeFile(filePath, fileContent) {
    try {
        await fs.writeFile(filePath, fileContent, 'utf-8', (err) => {
            if (err) {
                return console.error(`Error writing to file: ${err.message}`);
            }
            console.log('File written successfully.');

            // Use 'start' for Windows, 'open' for macOS, 'xdg-open' for Linux
            const openCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
            exec(`${openCmd} ${filePath}`, (err) => {
                if (err) {
                    console.error('Error opening file', err);
                } else {
                    console.log('File opened successfully');
                }
            });
        });

    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function deleteFile(filePath) {
    await fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting the file:', err);
            return;
        }
        console.log('File deleted successfully');
    });
}

//TODO - build full from relative for crawl efforts
const getLinks = (doc = {}) => {
    const linkArr = [];
    doc('a').each((i, link) => {
        const text = link.attribs.href;
        if (text && text.length > 0) {
            linkArr.push(text);

        }
    });

    return linkArr;
}

const getTitles = (doc = {}) => {
    const h1Arr = [];
    doc('h1').each((i, h1) => {
        const text = h1.name;
        h1Arr.push(text);
    });
    const h2Arr = [];
    doc('h2').each((i, h2) => {
        const text = h2.name;
        h2Arr.push(text);
    });
    const h3Arr = [];
    doc('h3').each((i, h3) => {
        const text = h3.name;
        h3Arr.push(text);
    });

    return {h1Arr, h2Arr, h3Arr};
}

const getListItems = (doc) => {
    // unordered list items
    const unorderedListItems = doc('ul'); // Select all <p> element
    const unordered = [];

    unorderedListItems.each((index, element) => {
        const text = doc(element).text(); // Get the text content of each <p> element
        unordered.push(text);
    });

    // order list
    const orderedList = doc('ol'); // Select all <p> elements
    const ordered = [];
    orderedList.each((index, element) => {
        const text = doc(element).text(); // Get the text content of each <p> element
        ordered.push(text);
    });

    return {unordered, ordered};
};

const getTextFromParagraphs = (doc) => {
    const paragraphs = doc('p'); // Select all <p> elements
    let textArr = [];

    paragraphs.each((index, element) => {
        const text = doc(element).text(); // Get the text content of each <p> element
        textArr.push(text);
    });
    /*
        const div = doc('div'); // Select all <p> elements
        div.each((index, element) => {
            const text = doc(element).text(); // Get the text content of each <p> element
            textArr.push(`${text}\r\n`);
        });
    */

    return textArr;
};

let links = [];
let globalContent = [];
let globalTitles = [];

/*function createLinks(urls) {
    const formatted =  urls.map(url => {
        return `<a href="${url}" >${url}</a>`;
    });
    console.log(formatted);
    return formatted;
}*/

async function getUrlInfo(url = 'http://localhost:32635/getUrlInfo') {
    try {
        if (!url) {
            return null;
        }

        const htmlString = await fetchPage(url);
        //
        console.log('htmlString: ', htmlString);
        if (htmlString.length > 0) {
            const doc = await cheerio.load(htmlString);

            console.log('document parsed: ', doc.length);

            const linkArr = getLinks(doc);
            if (linkArr && linkArr.length > 0) {
                linkArr.forEach((link) => {
                    if (link.startsWith('http')) {
                        console.log('external link: ', link);
                        links.push(link);
                    }
                })
            }


            const {h1Arr, h2Arr, h3Arr} = getTitles(doc);
            if (h1Arr && h1Arr.length > 0) {
                h1Arr.forEach((title) => {
                    console.log('h1 title: ', title);
                    globalTitles.push(title.trim());
                })
            }
            if (h2Arr && h2Arr.length > 0) {
                h2Arr.forEach((title) => {
                    console.log('h2 title: ', title);
                    globalTitles.push(title.trim());
                })
            }
            if (h3Arr && h3Arr.length > 0) {
                h3Arr.forEach((title) => {
                    console.log('h3 title: ', title);
                    globalTitles.push(title.trim());
                })
            }

            const content = getTextFromParagraphs(doc);
            if (content && content.length > 0) {
                content.forEach((text) => {
                    console.log('paragraph text: ', text);
                    globalContent.push(text.trim());
                })
            }

            const {ordered, unordered} = getListItems(doc);
            if (ordered && ordered.length > 0) {
                ordered.forEach((text) => {
                    console.log('ordered list text: ', text);
                    globalContent.push(text.trim());
                })
            }
            if (unordered && unordered.length > 0) {
                unordered.forEach((text) => {
                    console.log('unordered list text: ', text);
                    globalContent.push(text.trim());
                })
            }

            if (fs.existsSync('./html/scraped.txt')) {
                await deleteFile('C:/Projects/scrape/html/scraped.txt');
            }

            globalContent.push(globalTitles);
            globalContent.push(links);

            await writeFile('./html/scraped.txt', globalContent.join('\n\n'), (err) => {
                console.log(err);
                throw err;
            });

            return { globalContent, links };
        } else {
            console.log('html parsed not found');
        }
    } catch
        (error) {
        if (error.code === 'ENOENT') {
            console.log('HTML file not found');
        } else {
            console.error('An error occurred:', error);
        }
        throw error;
    }
}

module.exports = getUrlInfo;