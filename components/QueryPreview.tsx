'use client';

import { useState } from 'react';
import { useQueryStore } from '@/store/queryStore';
import { QueryBuilder } from '@/lib/queryBuilder';
import { StrapiApiService } from '@/lib/strapiApi';

export default function QueryPreview() {
  const {
    strapiUrl,
    apiKey,
    selectedCollection,
    fields,
    populate,
    sort,
    filters,
    pagination,
    setData,
    setLoading,
    setError,
  } = useQueryStore();

  const [copied, setCopied] = useState(false);

  const queryString = QueryBuilder.buildQueryString({
    fields,
    populate,
    sort,
    filters,
    pagination,
  });

  const fullUrl = selectedCollection
    ? `${strapiUrl}/api/${selectedCollection}${queryString ? `?${queryString}` : ''}`
    : '';

  const handleCopyUrl = async () => {
    if (fullUrl) {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyQueryString = async () => {
    if (queryString) {
      await navigator.clipboard.writeText(queryString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExecuteQuery = async () => {
    if (!selectedCollection) {
      setError('Please select a collection first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const api = new StrapiApiService(strapiUrl, apiKey);
      const response = await api.executeQuery(selectedCollection, queryString);

      setData(
        Array.isArray(response.data) ? response.data : [response.data],
        response.meta
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Query Preview
      </h2>

      <div className="space-y-4">
        {/* Full URL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Full URL
            </label>
            <button
              onClick={handleCopyUrl}
              disabled={!fullUrl}
              className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md overflow-x-auto">
            <code className="text-xs text-gray-800 break-all">
              {fullUrl || 'Select a collection to see the URL'}
            </code>
          </div>
        </div>

        {/* Query String Only */}
        {queryString && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Query String
              </label>
              <button
                onClick={handleCopyQueryString}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {copied ? 'Copied!' : 'Copy Query'}
              </button>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md overflow-x-auto">
              <code className="text-xs text-gray-800 break-all">
                ?{queryString}
              </code>
            </div>
          </div>
        )}

        {/* Execute Button */}
        <button
          onClick={handleExecuteQuery}
          disabled={!selectedCollection}
          className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Execute Query
        </button>

        {/* Query Summary */}
        {selectedCollection && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Query Summary
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <span className="font-medium">Collection:</span> {selectedCollection}
              </p>
              {fields.length > 0 && (
                <p>
                  <span className="font-medium">Fields:</span> {fields.length}{' '}
                  selected
                </p>
              )}
              {populate.length > 0 && (
                <p>
                  <span className="font-medium">Populate:</span> {populate.length}{' '}
                  relations
                </p>
              )}
              {sort.length > 0 && (
                <p>
                  <span className="font-medium">Sort:</span> {sort.length} criteria
                </p>
              )}
              {filters && (
                <p>
                  <span className="font-medium">Filters:</span>{' '}
                  {filters.conditions.length} conditions
                </p>
              )}
              <p>
                <span className="font-medium">Pagination:</span> Page{' '}
                {pagination.page || 1}, Size {pagination.pageSize || 25}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
