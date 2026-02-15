
import React from 'react';
import type { WebImageResult } from '../types';
import LinkIcon from './icons/LinkIcon';

interface WebImageResultsProps {
    results: WebImageResult[];
    query: string;
}

const WebImageResults: React.FC<WebImageResultsProps> = ({ results, query }) => {
    if (!results || results.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-5xl mx-auto mt-8">
            <h2 className="text-2xl font-semibold text-slate-200 mb-2">
                Image Search Results for: <span className="text-cyan-400">"{query}"</span>
            </h2>
            <p className="text-sm text-slate-400 mb-6">These images were found on the web by the AI assistant.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 flex flex-col group">
                        <div className="aspect-video overflow-hidden bg-slate-900">
                           <img
                                src={result.imageUrl}
                                alt={result.description}
                                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                                // Add error handling for broken image links
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // prevent infinite loop
                                    // A placeholder could be better
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2.4-3.4-4-6.2-4.2-1.5-.1-2.9.3-4.2 1.1-2.3 1.5-3.6 4-3.2 6.5.4 2.2 2.3 4 4.6 4.5.2.1.4.1.6.1H16c.9 0 1.7-.3 2.4-1z'/%3E%3Cpath d='M7 20.7A10 10 0 1 0 3.3 10'/%3E%3C/svg%3E";
                                    target.style.objectFit = 'contain';
                                    target.style.padding = '2rem';
                                }}
                           />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <p className="text-slate-300 text-sm mb-4 flex-grow">{result.description}</p>
                            <a
                                href={result.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
                            >
                                <LinkIcon className="w-3 h-3 mr-2" />
                                <span>Source</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WebImageResults;
