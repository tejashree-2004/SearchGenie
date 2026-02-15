
import React, { useState, useCallback } from 'react';
import type { WebSearchResult, GeneratedImageResult, WebImageResult, SearchType } from './types';
import { geminiService } from './services/geminiService';

import SearchInput from './components/SearchInput';
import LoadingSpinner from './components/LoadingSpinner';
import SearchResults from './components/SearchResults';
import ImageResults from './components/ImageResults';
import WebImageResults from './components/WebImageResults'; // New import
import BotIcon from './components/icons/BotIcon';
import SearchIcon from './components/icons/SearchIcon';
import ImageIcon from './components/icons/ImageIcon';

const WelcomeScreen: React.FC = () => (
    <div className="text-center max-w-3xl mx-auto mt-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
        <BotIcon className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
        <h2 className="text-3xl font-bold text-slate-100 mb-2">AI Search Agent</h2>
        <p className="text-slate-400 mb-6">Use the selector to switch between Web Search, Image Search, and Image Generation.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-slate-800 p-4 rounded-lg">
                <p className="font-semibold text-slate-200 flex items-center mb-2"><SearchIcon className="w-5 h-5 mr-2 text-cyan-400"/>Web Search</p>
                <p className="text-sm text-slate-400">"Latest AI trends"</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
                <p className="font-semibold text-slate-200 flex items-center mb-2"><ImageIcon className="w-5 h-5 mr-2 text-cyan-400"/>Image Search</p>
                <p className="text-sm text-slate-400">"Photos of the aurora borealis"</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
                <p className="font-semibold text-slate-200 flex items-center mb-2"><ImageIcon className="w-5 h-5 mr-2 text-cyan-400"/>Generate Image</p>
                <p className="text-sm text-slate-400">"A futuristic city at sunset"</p>
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
    const [searchMode, setSearchMode] = useState<SearchType>('web');
    const [lastQuery, setLastQuery] = useState<string>('');
    const [lastSearchType, setLastSearchType] = useState<SearchType | null>(null);
    const [webResult, setWebResult] = useState<WebSearchResult | null>(null);
    const [webImageResults, setWebImageResults] = useState<WebImageResult[] | null>(null);
    const [generatedImageResults, setGeneratedImageResults] = useState<GeneratedImageResult[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialState, setIsInitialState] = useState<boolean>(true);

    const handleSearch = useCallback(async (query: string) => {
        setIsLoading(true);
        setError(null);
        setWebResult(null);
        setWebImageResults(null);
        setGeneratedImageResults(null);
        setIsInitialState(false);
        setLastQuery(query);
        setLastSearchType(searchMode);

        try {
            switch (searchMode) {
                case 'web':
                    const result = await geminiService.performWebSearch(query);
                    setWebResult(result);
                    break;
                case 'webImage':
                    const webImages = await geminiService.performWebImageSearch(query);
                    setWebImageResults(webImages);
                    break;
                case 'imageGeneration':
                    const urls = await geminiService.performImageGeneration(query);
                    const results = urls.map(url => ({ imageUrl: url, prompt: query }));
                    setGeneratedImageResults(results);
                    break;
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [searchMode]);

    const baseButtonClass = "flex items-center justify-center space-x-2 px-3 py-2 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 text-center text-sm sm:text-base";
    const activeClass = "bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20";
    const inactiveClass = "bg-slate-700 text-slate-300 hover:bg-slate-600";

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
            <header className="w-full max-w-3xl mx-auto text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 py-2">
                    AI Search Agent
                </h1>
            </header>

            <main className="w-full flex-grow flex flex-col items-center">
                <SearchInput onSearch={handleSearch} isLoading={isLoading} searchMode={searchMode} />
                
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-6">
                    <button
                        onClick={() => setSearchMode('web')}
                        className={`${baseButtonClass} ${searchMode === 'web' ? activeClass : inactiveClass}`}
                        aria-pressed={searchMode === 'web'}
                    >
                        <SearchIcon className="w-5 h-5" />
                        <span>Web Search</span>
                    </button>
                    <button
                        onClick={() => setSearchMode('webImage')}
                        className={`${baseButtonClass} ${searchMode === 'webImage' ? activeClass : inactiveClass}`}
                        aria-pressed={searchMode === 'webImage'}
                    >
                        <ImageIcon className="w-5 h-5" />
                        <span>Image Search</span>
                    </button>
                    <button
                        onClick={() => setSearchMode('imageGeneration')}
                        className={`${baseButtonClass} ${searchMode === 'imageGeneration' ? activeClass : inactiveClass}`}
                        aria-pressed={searchMode === 'imageGeneration'}
                    >
                        <ImageIcon className="w-5 h-5" />
                        <span>Generate Image</span>
                    </button>
                </div>

                <div className="w-full">
                    {isLoading && <LoadingSpinner />}
                    {error && (
                        <div className="w-full max-w-2xl mx-auto p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center mt-8">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {isInitialState && <WelcomeScreen />}
                    
                    {!isLoading && !error && lastSearchType === 'web' && webResult && (
                        <SearchResults result={webResult} query={lastQuery} />
                    )}
                    {!isLoading && !error && lastSearchType === 'webImage' && webImageResults && (
                        <WebImageResults results={webImageResults} query={lastQuery} />
                    )}
                    {!isLoading && !error && lastSearchType === 'imageGeneration' && generatedImageResults && (
                        <ImageResults results={generatedImageResults} />
                    )}
                </div>
            </main>

            <footer className="w-full text-center mt-12 pb-4">
                <p className="text-sm text-slate-500">
                    Powered by Google Gemini.
                </p>
            </footer>
        </div>
    );
};

export default App;
