import React, { useState } from 'react';
import { ExternalLink, Link, Search, Filter, Globe, FileText, Image, Calendar, Package } from 'lucide-react';

const WebScraperGallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLink, setSelectedLink] = useState(null);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    links: [],
    content: []
  });

  // Function to scrape URL
  const handleScrape = async () => {
    if (!urlToScrape.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/getUrlInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToScrape }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Transform the data to match our expected format
      const transformedData = {
        links: result.links || [],
        content: result.content || []
      };

      setData(transformedData);
    } catch (err) {
      setError(err.message || 'Failed to scrape URL');
      console.error('Scraping error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract card name from img alt text or use regular text
  const extractCardName = (text) => {
    if (text.includes('<img')) {
      const match = text.match(/alt="([^"]+)"/);
      return match ? match[1].replace(' card', '') : 'Image';
    }
    return text === '[no text]' ? 'Untitled' : text;
  };

  // Extract image URL from text if it contains img tag
  const extractImageUrl = (text) => {
    if (text.includes('<img')) {
      const match = text.match(/src="([^"]+)"/);
      return match ? match[1] : null;
    }
    return null;
  };

  // Check if link is a card (has image)
  const isCardLink = (link) => link.text.includes('<img');

  // Filter links based on search and filter type
  const filteredLinks = data.links.filter(link => {
    const cardName = extractCardName(link.text).toLowerCase();
    const matchesSearch = cardName.includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'external') return matchesSearch && link.isExternal;
    if (filterType === 'internal') return matchesSearch && !link.isExternal;
    if (filterType === 'cards') return matchesSearch && isCardLink(link);
    if (filterType === 'links') return matchesSearch && !isCardLink(link);

    return matchesSearch;
  });

  // Group links by type
  const cardLinks = filteredLinks.filter(isCardLink);
  const regularLinks = filteredLinks.filter(link => !isCardLink(link));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Web Scraper Tool
          </h1>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="bg-gray-800/50 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <span>{data.links.length} Total Links</span>
            </div>
            {data.content && data.content.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-400" />
                <span>{data.content.length} Content Items</span>
              </div>
            )}
          </div>
        </div>

        {/* URL Input Form */}
        <div className="mb-8 bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            Enter URL to Scrape
          </h2>
          <div className="flex gap-4">
            <input
              type="url"
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              value={urlToScrape}
              onChange={(e) => setUrlToScrape(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScrape()}
            />
            <button
              onClick={handleScrape}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Scrape
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search links..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Links</option>
            <option value="external">External Only</option>
            <option value="internal">Internal Only</option>
            <option value="cards">Cards Only</option>
            <option value="links">Links Only</option>
          </select>
        </div>

        {/* Content Section */}
        {data.content && data.content.length > 0 && (
          <div className="mb-8 bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              Page Content
            </h2>
            <div className="space-y-2">
              {data.content.map((content, index) => (
                <div key={index} className="text-gray-300">
                  {content.includes('Release date:') && <Calendar className="inline w-4 h-4 mr-2 text-blue-400" />}
                  {content}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {cardLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Image className="w-6 h-6 text-purple-400" />
              Cards ({cardLinks.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cardLinks.map((link, index) => {
                const cardName = extractCardName(link.text);
                const imageUrl = extractImageUrl(link.text);

                return (
                  <div
                    key={index}
                    className="group relative bg-gray-800/50 backdrop-blur rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                    onClick={() => setSelectedLink(link)}
                  >
                    {imageUrl ? (
                      <div className="aspect-[3/4] relative">
                        <img
                          src={imageUrl}
                          alt={cardName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] flex items-center justify-center bg-gray-700">
                        <Image className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-sm font-semibold text-white truncate">{cardName}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Links */}
        {regularLinks.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Link className="w-6 h-6 text-purple-400" />
              Links ({regularLinks.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target={link.isExternal ? "_blank" : "_self"}
                  rel={link.isExternal ? "noopener noreferrer" : ""}
                  className="group bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {link.isExternal ? (
                      <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    ) : (
                      <Globe className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{extractCardName(link.text)}</p>
                      <p className="text-xs text-gray-400 truncate">{link.url}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {filteredLinks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No links found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Modal for selected card */}
      {selectedLink && isCardLink(selectedLink) && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLink(null)}
        >
          <div
            className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{extractCardName(selectedLink.text)}</h3>
                <button
                  onClick={() => setSelectedLink(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              {extractImageUrl(selectedLink.text) && (
                <img
                  src={extractImageUrl(selectedLink.text)}
                  alt={extractCardName(selectedLink.text)}
                  className="w-full rounded-lg mb-4"
                />
              )}
              <a
                href={selectedLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                View on Gatherer
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebScraperGallery;