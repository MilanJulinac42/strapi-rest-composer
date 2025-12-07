'use client';

import { useState } from 'react';
import { useQueryStore } from '@/store/queryStore';

export default function FieldSelector() {
  const { selectedCollection, contentTypes, fields, addField, removeField } =
    useQueryStore();
  const [newField, setNewField] = useState('');

  const selectedContentType = contentTypes.find(
    (ct) => ct.info?.pluralName === selectedCollection || ct.apiID === selectedCollection
  );

  const availableFields = selectedContentType?.attributes
    ? Object.keys(selectedContentType.attributes).filter(
        (key) => !selectedContentType.attributes[key].relation
      )
    : [];

  const handleAddField = (field: string) => {
    if (field && !fields.includes(field)) {
      addField(field);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Field Selection
      </label>

      {!selectedCollection ? (
        <p className="text-sm text-gray-500">Select a collection first</p>
      ) : (
        <div className="space-y-3">
          {/* Field Input */}
          <div className="flex gap-2">
            <select
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
            >
              <option value="" className="text-gray-500">
                {availableFields.length > 0 ? 'Select field...' : 'Loading fields...'}
              </option>
              {availableFields
                .filter((f) => !fields.includes(f))
                .map((field) => (
                  <option key={field} value={field} className="text-gray-900">
                    {field}
                  </option>
                ))}
            </select>
            <button
              onClick={() => {
                handleAddField(newField);
                setNewField('');
              }}
              disabled={!newField}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Selected Fields */}
          {fields.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Selected fields:</p>
              <div className="flex flex-wrap gap-2">
                {fields.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {field}
                    <button
                      onClick={() => removeField(field)}
                      className="hover:text-blue-900 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Leave empty to return all fields
          </p>
        </div>
      )}
    </div>
  );
}
