'use client';

import { useState } from 'react';
import { useQueryStore } from '@/store/queryStore';
import type { SortOption } from '@/lib/types';

export default function SortBuilder() {
  const { selectedCollection, contentTypes, sort, addSort, removeSort } =
    useQueryStore();
  const [newSortField, setNewSortField] = useState('');
  const [newSortOrder, setNewSortOrder] = useState<'asc' | 'desc'>('asc');

  const selectedContentType = contentTypes.find(
    (ct) => ct.info?.pluralName === selectedCollection || ct.apiID === selectedCollection
  );

  const availableFields = selectedContentType?.attributes
    ? Object.keys(selectedContentType.attributes).filter(
        (key) => !selectedContentType.attributes[key].relation
      )
    : [];

  const handleAddSort = () => {
    if (newSortField) {
      const newSort: SortOption = {
        field: newSortField,
        order: newSortOrder,
      };
      addSort(newSort);
      setNewSortField('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Sorting
      </label>

      {!selectedCollection ? (
        <p className="text-sm text-gray-500">Select a collection first</p>
      ) : (
        <div className="space-y-3">
          {/* Sort Input */}
          <div className="flex gap-2">
            {availableFields.length > 0 ? (
              <select
                value={newSortField}
                onChange={(e) => setNewSortField(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              >
                <option value="" className="text-gray-500">Select field...</option>
                {availableFields.map((field) => (
                  <option key={field} value={field} className="text-gray-900">
                    {field}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={newSortField}
                onChange={(e) => setNewSortField(e.target.value)}
                placeholder="Enter field name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            )}

            <select
              value={newSortOrder}
              onChange={(e) => setNewSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            >
              <option value="asc" className="text-gray-900">Ascending</option>
              <option value="desc" className="text-gray-900">Descending</option>
            </select>

            <button
              onClick={handleAddSort}
              disabled={!newSortField}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Sort List */}
          {sort.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Sort order:</p>
              <div className="space-y-2">
                {sort.map((sortOption, index) => (
                  <div
                    key={`${sortOption.field}-${index}`}
                    className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-md"
                  >
                    <span className="text-sm text-purple-800">
                      {index + 1}. {sortOption.field}{' '}
                      <span className="text-xs text-purple-600">
                        ({sortOption.order})
                      </span>
                    </span>
                    <button
                      onClick={() => removeSort(sortOption.field)}
                      className="text-purple-700 hover:text-purple-900 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
