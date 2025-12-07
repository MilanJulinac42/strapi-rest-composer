'use client';

import { useQueryStore } from '@/store/queryStore';

export default function PaginationControls() {
  const { pagination, setPagination } = useQueryStore();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pagination
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="page" className="block text-xs text-gray-600 mb-1">
            Page
          </label>
          <input
            id="page"
            type="number"
            min="1"
            value={pagination.page || 1}
            onChange={(e) =>
              setPagination({ page: parseInt(e.target.value) || 1 })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label htmlFor="pageSize" className="block text-xs text-gray-600 mb-1">
            Page Size
          </label>
          <input
            id="pageSize"
            type="number"
            min="1"
            max="100"
            value={pagination.pageSize || 25}
            onChange={(e) =>
              setPagination({ pageSize: parseInt(e.target.value) || 25 })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label htmlFor="start" className="block text-xs text-gray-600 mb-1">
            Start (optional)
          </label>
          <input
            id="start"
            type="number"
            min="0"
            value={pagination.start || ''}
            onChange={(e) =>
              setPagination({
                start: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label htmlFor="limit" className="block text-xs text-gray-600 mb-1">
            Limit (optional)
          </label>
          <input
            id="limit"
            type="number"
            min="1"
            value={pagination.limit || ''}
            onChange={(e) =>
              setPagination({
                limit: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="25"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Use either page/pageSize or start/limit pagination
      </p>
    </div>
  );
}
