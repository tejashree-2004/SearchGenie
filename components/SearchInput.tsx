
import React, { useState } from 'react';
import SearchIcon from './icons/SearchIcon';
import type { SearchType } from '../types';

interface SearchInputProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
    searchMode: SearchType;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading, searchMode }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && !isLoading) {
            onSearch(query.trim());
        }
    };

    const getPlaceholder = () => {
        switch(searchMode) {
            case 'web':
                return "Search the web for anything...";
            case 'webImage':
                return "Search the web for images of...";
            case 'imageGeneration':
                return "Describe an image to generate...";
            default:
                return "Enter your query...";
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={getPlaceholder()}
                    disabled={isLoading}
                    className="w-full pl-4 pr-16 py-4 bg-slate-800 border border-slate-700 rounded-full text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-14 h-full text-slate-300 hover:text-cyan-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                    aria-label="Search"
                >
                    <SearchIcon className="w-6 h-6" />
                </button>
            </div>
        </form>
    );
};

export default SearchInput;
