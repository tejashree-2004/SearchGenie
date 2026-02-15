
import React from 'react';
import type { WebSearchResult } from '../types';
import LinkIcon from './icons/LinkIcon';

interface SearchResultsProps {
    result: WebSearchResult;
    query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ result, query }) => {
    return (
        <div className="w-full max-w-3xl mx-auto mt-8 text-left bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">
                Search Result for: <span className="text-cyan-400">"{query}"</span>
            </h2>
            
            <div className="prose prose-invert prose-p:text-slate-300 prose-strong:text-slate-100 max-w-none mb-6">
                <p>{result.summary}</p>
            </div>

            {result.sources && result.sources.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-300 border-t border-slate-700 pt-4 mt-6 mb-4">
                        Sources
                    </h3>
                    <ul className="space-y-3">
                        {result.sources.map((source, index) => (
                            <li key={index} className="flex items-start">
                                <LinkIcon className="w-4 h-4 text-cyan-400 mt-1 mr-3 flex-shrink-0" />
                                <a
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:text-cyan-300 hover:underline break-words"
                                >
                                    {source.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
