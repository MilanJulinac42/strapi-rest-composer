'use client';

import { useQueryStore } from '@/store/queryStore';

export default function ResultsDisplay() {
  const { data, meta, loading, error } = useQueryStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>

      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && !data && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results</h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure your query and click &quot;Execute Query&quot; to see results
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && data && data.length > 0 && (
          <div className="space-y-4">
            {/* Meta Information */}
            {meta && typeof meta === 'object' && 'pagination' in meta && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Pagination Info
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div>
                    <span className="font-medium">Page:</span>{' '}
                    {(meta.pagination as any).page}
                  </div>
                  <div>
                    <span className="font-medium">Page Size:</span>{' '}
                    {(meta.pagination as any).pageSize}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span>{' '}
                    {(meta.pagination as any).total}
                  </div>
                  <div>
                    <span className="font-medium">Page Count:</span>{' '}
                    {(meta.pagination as any).pageCount}
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {data.length} {data.length === 1 ? 'result' : 'results'}
              </p>
            </div>

            {/* JSON Display */}
            <div className="max-h-[600px] overflow-auto border border-gray-200 rounded-md">
              <pre className="p-4 text-xs bg-gray-50">
                <code className="text-gray-800">
                  {JSON.stringify(data, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        )}

        {/* Empty Results */}
        {!loading && !error && data && data.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No results found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The query returned no data. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
