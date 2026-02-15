
export interface WebResultSource {
  title: string;
  uri: string;
}

export interface WebSearchResult {
  summary: string;
  sources: WebResultSource[];
}

// For AI Image Generation
export interface GeneratedImageResult {
  imageUrl: string;
  prompt: string;
}

// For Web Image Search
export interface WebImageResult {
    imageUrl: string;
    sourceUrl: string;
    description: string;
}

export type SearchType = 'web' | 'webImage' | 'imageGeneration';
