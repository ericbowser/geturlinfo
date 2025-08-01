// Debug version - replace your getUrlInfo.js temporarily to see what's happening

const cheerio = require('cheerio');
const fs = require('fs').promises;
const {get} = require('axios');

function isValidUrl(url) {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$', 'i');
    return !!urlPattern.test(url);
}

async function fetchPage(url) {
    try {
        console.log('🔍 Fetching URL:', url);

        if (!isValidUrl(url)) {
            console.error('❌ Invalid URL:', url);
            return null;
        }

        // Add headers to look more like a real browser
        const response = await get(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            timeout: 10000
        });

        console.log('✅ Response received');
        console.log('📊 Status:', response.status);
        console.log('📏 Content length:', response.data.length);
        console.log('🔤 Content type:', response.headers['content-type']);
        console.log('📝 First 500 chars:', response.data.substring(0, 500));

        return response.data;
    } catch (error) {
        console.error('❌ Fetch error:', error.message);
        if (error.response) {
            console.error('📊 Error status:', error.response.status);
            console.error('📝 Error data:', error.response.data?.substring(0, 200));
        }
        throw error;
    }
}

const getLinks = (doc, baseUrl) => {
    console.log('🔗 Looking for links...');
    const linkArr = [];

    doc('a[href]').each((i, link) => {
        const href = link.attribs.href;
        const text = doc(link).text().trim();

        if (href && href.length > 0) {
            try {
                const absoluteUrl = new URL(href, baseUrl).href;
                linkArr.push({
                    url: absoluteUrl,
                    text: text || '[no text]',
                    isExternal: href.startsWith('http')
                });
            } catch (e) {
                console.log('⚠️ Skipping invalid URL:', href);
            }
        }
    });

    console.log(`🔗 Found ${linkArr.length} links`);
    return linkArr;
}

const getTitles = (doc) => {
    console.log('📋 Looking for headings...');
    const titles = [];

    doc('h1, h2, h3, h4, h5, h6').each((i, heading) => {
        const text = doc(heading).text().trim();
        if (text) {
            titles.push({
                level: parseInt(heading.tagName[1]),
                text: text
            });
        }
    });

    console.log(`📋 Found ${titles.length} headings`);
    if (titles.length > 0) {
        console.log('📋 First few headings:', titles.slice(0, 3));
    }
    return titles;
}

const getTextFromParagraphs = (doc) => {
    console.log('📝 Looking for paragraphs...');
    const paragraphs = [];

    doc('p').each((index, element) => {
        const text = doc(element).text().trim();
        if (text && text.length > 10) { // Only meaningful paragraphs
            paragraphs.push(text);
        }
    });

    console.log(`📝 Found ${paragraphs.length} paragraphs`);
    return paragraphs;
};

async function getUrlInfo(url) {
    try {
        console.log('🚀 Starting scrape for:', url);

        if (!url) {
            throw new Error('URL is required');
        }

        const htmlString = await fetchPage(url);
        if (!htmlString || htmlString.length === 0) {
            throw new Error('No HTML content received');
        }

        console.log('🔍 Parsing HTML...');
        const doc = cheerio.load(htmlString);

        // Check what elements exist
        console.log('📊 Document stats:');
        console.log('  - Total elements:', doc('*').length);
        console.log('  - Links found:', doc('a').length);
        console.log('  - Paragraphs found:', doc('p').length);
        console.log('  - Headings found:', doc('h1, h2, h3, h4, h5, h6').length);
        console.log('  - Title:', doc('title').first().text().trim());

        const links = getLinks(doc, url);
        const titles = getTitles(doc);
        const paragraphs = getTextFromParagraphs(doc);

        const result = {
            links: links,
            globalContent: [...paragraphs, ...titles.map(t => t.text)]
        };

        console.log('✅ Scraping complete!');
        console.log(`📊 Final results: ${result.links.length} links, ${result.globalContent.length} content items`);

        return result;

    } catch (error) {
        console.error('💥 Error in getUrlInfo:', error.message);
        throw error;
    }
}

module.exports = getUrlInfo;