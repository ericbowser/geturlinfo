import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Eye, Filter, Globe, BookOpen, TrendingUp, Clock, Link2 } from 'lucide-react';

const MarketResearchDashboard = () => {
  const [activeTab, setActiveTab] = useState('scrape');
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Cloud Computing Trends",
      keywords: ["cloud bursting", "hybrid cloud", "serverless"],
      urls: 3,
      lastUpdate: "2 hours ago",
      status: "active"
    },
    {
      id: 2,
      name: "AI Tool Market Analysis",
      keywords: ["GPT", "AI tools", "automation"],
      urls: 7,
      lastUpdate: "1 day ago",
      status: "completed"
    }
  ]);
  const [scrapedData, setScrapedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleScrape = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call to your backend
    setTimeout(() => {
      const mockData = {
        url: url,
        title: "Sample Page Title",
        scrapedAt: new Date().toISOString(),
        links: [
          { url: "https://example.com/page1", text: "Cloud Migration Guide", relevance: 9.2 },
          { url: "https://example.com/page2", text: "Hybrid Cloud Solutions", relevance: 8.7 },
          { url: "https://example.com/page3", text: "Cost Optimization", relevance: 7.5 }
        ],
        content: {
          titles: [
            { level: 1, text: "Introduction to Cloud Bursting" },
            { level: 2, text: "Benefits and Use Cases" },
            { level: 2, text: "Implementation Strategies" }
          ],
          paragraphs: [
            "Cloud bursting is a hybrid cloud computing technique...",
            "Organizations can leverage cloud bursting to handle peak loads..."
          ]
        }
      };
      setScrapedData(mockData);
      setIsLoading(false);
    }, 2000);
  };

  const RelevanceBar = ({ score }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${score > 8 ? 'bg-green-500' : score > 6 ? 'bg-yellow-500' : 'bg-orange-500'}`}
        style={{ width: `${score * 10}%` }}
      ></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Market Research Intelligence</h1>
          <p className="text-gray-600">Gather insights, analyze trends, and stay ahead of the competition</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          {[
            { id: 'scrape', label: 'Smart Scraper', icon: Globe },
            { id: 'projects', label: 'Research Projects', icon: BookOpen },
            { id: 'insights', label: 'Insights', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Smart Scraper Tab */}
        {activeTab === 'scrape' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-500" />
                Research Target
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/market-analysis"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Research Keywords</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="cloud computing, AI, market trends"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                </div>

                <button
                  onClick={handleScrape}
                  disabled={!url.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Start Intelligence Gathering
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-green-500" />
                Intelligence Report
              </h2>
              
              {!scrapedData ? (
                <div className="text-center py-12 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter a URL and keywords to start gathering intelligence</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="border-b pb-3">
                    <h3 className="font-medium text-gray-900">{scrapedData.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(scrapedData.scrapedAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Relevant Links ({scrapedData.links.length})</h4>
                    <div className="space-y-2">
                      {scrapedData.links.map((link, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                              <Link2 className="w-3 h-3 mr-1" />
                              {link.text}
                            </a>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {link.relevance}/10
                            </span>
                          </div>
                          <RelevanceBar score={link.relevance} />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Research Data
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* New Project Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-center">Start New Research</h3>
              <p className="text-blue-100 text-center text-sm mt-2">Create a new market research project</p>
            </div>

            {/* Existing Projects */}
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Filter className="w-3 h-3 mr-1" />
                    {project.keywords.join(', ')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-3 h-3 mr-1" />
                    {project.urls} URLs tracked
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-3 h-3 mr-1" />
                    Updated {project.lastUpdate}
                  </div>
                </div>
                
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  View Insights
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Market Insights Coming Soon</h3>
              <p>AI-powered trend analysis and competitive intelligence will appear here</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MarketResearchDashboard;