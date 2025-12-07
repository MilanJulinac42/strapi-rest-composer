// Strapi v5 Types

export interface StrapiAttribute {
  type: string;
  required?: boolean;
  unique?: boolean;
  minLength?: number;
  maxLength?: number;
  relation?: string;
  target?: string;
  inversedBy?: string;
  mappedBy?: string;
}

export interface StrapiContentType {
  uid: string;
  apiID: string;
  kind: 'collectionType' | 'singleType';
  info: {
    singularName: string;
    pluralName: string;
    displayName: string;
    description?: string;
  };
  options: {
    draftAndPublish?: boolean;
  };
  attributes: Record<string, StrapiAttribute>;
}

export interface StrapiSchema {
  contentTypes: StrapiContentType[];
}

// Query Builder Types

export interface PopulateField {
  field: string;
  populate?: PopulateField[];
  fields?: string[];
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterCondition {
  field: string;
  operator: '$eq' | '$ne' | '$lt' | '$lte' | '$gt' | '$gte' | '$in' | '$notIn' | '$contains' | '$notContains' | '$containsi' | '$notContainsi' | '$null' | '$notNull' | '$between' | '$startsWith' | '$endsWith';
  value: string | number | boolean | null | Array<string | number>;
}

export interface FilterGroup {
  operator: '$and' | '$or';
  conditions: (FilterCondition | FilterGroup)[];
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  start?: number;
  limit?: number;
}

export interface QueryBuilderState {
  // Connection
  strapiUrl: string;
  apiKey: string;

  // Selected collection
  selectedCollection: string | null;

  // Available content types from Strapi
  contentTypes: StrapiContentType[];

  // Query options
  fields: string[];
  populate: PopulateField[];
  sort: SortOption[];
  filters: FilterGroup | null;
  pagination: PaginationOptions;

  // Results
  data: unknown[] | null;
  meta: unknown | null;
  loading: boolean;
  error: string | null;
}

export interface StrapiResponse<T = unknown> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: unknown;
  };
}
