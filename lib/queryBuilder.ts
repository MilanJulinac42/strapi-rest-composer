import type {
  PopulateField,
  SortOption,
  FilterGroup,
  FilterCondition,
  PaginationOptions,
} from './types';

export class QueryBuilder {
  /**
   * Build populate query parameter for Strapi v5
   * Uses LHS bracket notation for cleaner URLs
   */
  static buildPopulate(populate: PopulateField[]): string {
    if (populate.length === 0) return '';

    const params: string[] = [];

    const buildPopulateParams = (fields: PopulateField[], prefix: string = 'populate') => {
      fields.forEach((field) => {
        const hasPopulate = field.populate && field.populate.length > 0;
        const hasFields = field.fields && field.fields.length > 0;
        const fieldPath = prefix ? `${prefix}[${field.field}]` : field.field;

        if (hasPopulate || hasFields) {
          // Complex populate with nested structure
          if (hasFields) {
            // Add fields for this populate
            params.push(`${fieldPath}[fields]=${field.fields!.join(',')}`);
          }

          if (hasPopulate) {
            // Recursively add nested populations with [populate] in the path
            buildPopulateParams(field.populate!, `${fieldPath}[populate]`);
          } else if (!hasFields) {
            // Just mark as populated
            params.push(`${fieldPath}=true`);
          }
        } else {
          // Simple populate
          params.push(`${fieldPath}=true`);
        }
      });
    };

    buildPopulateParams(populate);
    return params.join('&');
  }

  /**
   * Build fields query parameter
   */
  static buildFields(fields: string[]): string {
    if (fields.length === 0) return '';
    return `fields=${fields.join(',')}`;
  }

  /**
   * Build sort query parameter
   */
  static buildSort(sort: SortOption[]): string {
    if (sort.length === 0) return '';

    const sortParams = sort.map((s) => `${s.field}:${s.order}`).join(',');
    return `sort=${sortParams}`;
  }

  /**
   * Build filters query parameter for Strapi v5
   */
  static buildFilters(filters: FilterGroup | null): string {
    if (!filters) return '';

    const buildFilterObject = (
      filter: FilterGroup | FilterCondition
    ): Record<string, unknown> => {
      if ('operator' in filter && 'conditions' in filter) {
        // FilterGroup
        return {
          [filter.operator]: filter.conditions.map((condition) =>
            buildFilterObject(condition)
          ),
        };
      } else {
        // FilterCondition
        const condition = filter as FilterCondition;
        return {
          [condition.field]: {
            [condition.operator]: condition.value,
          },
        };
      }
    };

    const filterObj = buildFilterObject(filters);
    return `filters=${encodeURIComponent(JSON.stringify(filterObj))}`;
  }

  /**
   * Build pagination query parameter
   */
  static buildPagination(pagination: PaginationOptions): string {
    const params: string[] = [];

    if (pagination.page !== undefined) {
      params.push(`pagination[page]=${pagination.page}`);
    }
    if (pagination.pageSize !== undefined) {
      params.push(`pagination[pageSize]=${pagination.pageSize}`);
    }
    if (pagination.start !== undefined) {
      params.push(`pagination[start]=${pagination.start}`);
    }
    if (pagination.limit !== undefined) {
      params.push(`pagination[limit]=${pagination.limit}`);
    }

    return params.join('&');
  }

  /**
   * Build complete query string
   */
  static buildQueryString(options: {
    fields?: string[];
    populate?: PopulateField[];
    sort?: SortOption[];
    filters?: FilterGroup | null;
    pagination?: PaginationOptions;
  }): string {
    const parts: string[] = [];

    if (options.fields && options.fields.length > 0) {
      parts.push(this.buildFields(options.fields));
    }

    if (options.populate && options.populate.length > 0) {
      parts.push(this.buildPopulate(options.populate));
    }

    if (options.sort && options.sort.length > 0) {
      parts.push(this.buildSort(options.sort));
    }

    if (options.filters) {
      parts.push(this.buildFilters(options.filters));
    }

    if (options.pagination) {
      parts.push(this.buildPagination(options.pagination));
    }

    return parts.filter((p) => p).join('&');
  }
}
