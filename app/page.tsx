'use client';

import { useEffect } from 'react';
import { useQueryStore } from '@/store/queryStore';
import { StrapiApiService } from '@/lib/strapiApi';
import CollectionSelector from '@/components/CollectionSelector';
import FieldSelector from '@/components/FieldSelector';
import PopulateBuilder from '@/components/PopulateBuilder';
import SortBuilder from '@/components/SortBuilder';
import PaginationControls from '@/components/PaginationControls';
import FilterBuilder from '@/components/FilterBuilder';
import QueryPreview from '@/components/QueryPreview';
import ResultsDisplay from '@/components/ResultsDisplay';

export default function Home() {
  const { strapiUrl, apiKey, setContentTypes, setConnection } = useQueryStore();

  useEffect(() => {
    // Initialize connection from environment variables
    const url = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const key = process.env.NEXT_PUBLIC_API_KEY || '';

    setConnection(url, key);

    // Fetch content types on mount
    const fetchContentTypes = async () => {
      const api = new StrapiApiService(url, key);
      try {
        const contentTypes = await api.fetchContentTypes();
        setContentTypes(contentTypes);
      } catch (error) {
        console.error('Failed to fetch content types:', error);
      }
    };

    if (url && key) {
      fetchContentTypes();
    }
  }, [setConnection, setContentTypes]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Strapi REST Query Builder
          </h1>
          <p className="text-gray-600">
            Visual query builder for Strapi v5 REST API
          </p>
        </header>

        {/* Main Layout: Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Query Builder */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Query Configuration
              </h2>

              <div className="space-y-6">
                <CollectionSelector />
                <FieldSelector />
                <PopulateBuilder />
                <FilterBuilder />
                <SortBuilder />
                <PaginationControls />
              </div>
            </div>
          </div>

          {/* Right Panel: Preview & Results */}
          <div className="space-y-4">
            <QueryPreview />
            <ResultsDisplay />
          </div>
        </div>
      </div>
    </main>
  );
}
