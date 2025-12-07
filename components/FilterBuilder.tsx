'use client';

import { useState } from 'react';
import { useQueryStore } from '@/store/queryStore';
import type { FilterCondition } from '@/lib/types';

const OPERATORS = [
  { value: '$eq', label: 'Equals' },
  { value: '$ne', label: 'Not Equals' },
  { value: '$lt', label: 'Less Than' },
  { value: '$lte', label: 'Less Than or Equal' },
  { value: '$gt', label: 'Greater Than' },
  { value: '$gte', label: 'Greater Than or Equal' },
  { value: '$in', label: 'In Array' },
  { value: '$notIn', label: 'Not In Array' },
  { value: '$contains', label: 'Contains' },
  { value: '$notContains', label: 'Not Contains' },
  { value: '$containsi', label: 'Contains (case insensitive)' },
  { value: '$notContainsi', label: 'Not Contains (case insensitive)' },
  { value: '$null', label: 'Is Null' },
  { value: '$notNull', label: 'Is Not Null' },
  { value: '$startsWith', label: 'Starts With' },
  { value: '$endsWith', label: 'Ends With' },
] as const;

export default function FilterBuilder() {
  const { selectedCollection, contentTypes, filters, setFilters } =
    useQueryStore();
  const [newFilterField, setNewFilterField] = useState('');
  const [newFilterOperator, setNewFilterOperator] = useState<FilterCondition['operator']>('$eq');
  const [newFilterValue, setNewFilterValue] = useState('');

  const selectedContentType = contentTypes.find(
    (ct) => ct.info?.pluralName === selectedCollection || ct.apiID === selectedCollection
  );

  const availableFields = selectedContentType?.attributes
    ? Object.keys(selectedContentType.attributes).filter(
        (key) => !selectedContentType.attributes[key].relation
      )
    : [];

  const handleAddFilter = () => {
    if (!newFilterField) return;

    const needsValue = !['$null', '$notNull'].includes(newFilterOperator);
    if (needsValue && !newFilterValue) return;

    let value: string | number | boolean | null | Array<string | number> = newFilterValue;

    // Parse value based on operator
    if (['$null', '$notNull'].includes(newFilterOperator)) {
      value = null;
    } else if (['$in', '$notIn'].includes(newFilterOperator)) {
      value = newFilterValue.split(',').map((v) => v.trim());
    } else if (!isNaN(Number(newFilterValue))) {
      value = Number(newFilterValue);
    } else if (newFilterValue === 'true' || newFilterValue === 'false') {
      value = newFilterValue === 'true';
    }

    const newCondition: FilterCondition = {
      field: newFilterField,
      operator: newFilterOperator,
      value,
    };

    // For now, simple implementation: replace filters with single condition
    // In a more advanced version, we would support $and/$or groups
    setFilters({
      operator: '$and',
      conditions: filters
        ? [...filters.conditions, newCondition]
        : [newCondition],
    });

    setNewFilterField('');
    setNewFilterValue('');
  };

  const handleRemoveFilter = (index: number) => {
    if (!filters) return;

    const newConditions = filters.conditions.filter((_, i) => i !== index);
    if (newConditions.length === 0) {
      setFilters(null);
    } else {
      setFilters({
        operator: filters.operator,
        conditions: newConditions,
      });
    }
  };

  const handleClearFilters = () => {
    setFilters(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Filters
        </label>
        {filters && filters.conditions.length > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>

      {!selectedCollection ? (
        <p className="text-sm text-gray-500">Select a collection first</p>
      ) : (
        <div className="space-y-3">
          {/* Filter Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              {availableFields.length > 0 ? (
                <select
                  value={newFilterField}
                  onChange={(e) => setNewFilterField(e.target.value)}
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
                  value={newFilterField}
                  onChange={(e) => setNewFilterField(e.target.value)}
                  placeholder="Field name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              )}

              <select
                value={newFilterOperator}
                onChange={(e) =>
                  setNewFilterOperator(e.target.value as FilterCondition['operator'])
                }
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value} className="text-gray-900">
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {!['$null', '$notNull'].includes(newFilterOperator) && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFilterValue}
                  onChange={(e) => setNewFilterValue(e.target.value)}
                  placeholder={
                    ['$in', '$notIn'].includes(newFilterOperator)
                      ? 'value1, value2, value3'
                      : 'Value'
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  onClick={handleAddFilter}
                  disabled={!newFilterField || !newFilterValue}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            )}

            {['$null', '$notNull'].includes(newFilterOperator) && (
              <button
                onClick={handleAddFilter}
                disabled={!newFilterField}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Filter
              </button>
            )}
          </div>

          {/* Active Filters */}
          {filters && filters.conditions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                Active filters ({filters.operator}):
              </p>
              <div className="space-y-2">
                {filters.conditions.map((condition, index) => {
                  const cond = condition as FilterCondition;
                  return (
                    <div
                      key={index}
                      className="flex items-start justify-between p-2 bg-orange-50 border border-orange-200 rounded-md"
                    >
                      <div className="text-sm text-orange-800">
                        <span className="font-medium">{cond.field}</span>{' '}
                        <span className="text-xs text-orange-600">
                          {OPERATORS.find((op) => op.value === cond.operator)?.label}
                        </span>{' '}
                        {cond.value !== null && (
                          <span className="font-medium">
                            {Array.isArray(cond.value)
                              ? cond.value.join(', ')
                              : String(cond.value)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveFilter(index)}
                        className="text-orange-700 hover:text-orange-900 focus:outline-none ml-2"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
