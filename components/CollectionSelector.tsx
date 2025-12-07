'use client';

import { useQueryStore } from '@/store/queryStore';

export default function CollectionSelector() {
  const { contentTypes, selectedCollection, setSelectedCollection } =
    useQueryStore();

  return (
    <div>
      <label
        htmlFor="collection"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Collection
      </label>
      <select
        id="collection"
        value={selectedCollection || ''}
        onChange={(e) => setSelectedCollection(e.target.value || null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      >
        <option value="" className="text-gray-500">Select a collection...</option>
        {contentTypes.map((ct) => (
          <option key={ct.uid} value={ct.info?.pluralName || ct.apiID} className="text-gray-900">
            {ct.info?.displayName || ct.apiID} ({ct.info?.pluralName || ct.apiID})
          </option>
        ))}
      </select>
      {contentTypes.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">
          No content types loaded. Check your Strapi connection.
        </p>
      )}
    </div>
  );
}
