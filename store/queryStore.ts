import { create } from 'zustand';
import type {
  QueryBuilderState,
  StrapiContentType,
  PopulateField,
  SortOption,
  FilterGroup,
  PaginationOptions,
} from '@/lib/types';

interface QueryStore extends QueryBuilderState {
  // Actions
  setConnection: (url: string, apiKey: string) => void;
  setContentTypes: (contentTypes: StrapiContentType[]) => void;
  setSelectedCollection: (collection: string | null) => void;
  setFields: (fields: string[]) => void;
  addField: (field: string) => void;
  removeField: (field: string) => void;
  setPopulate: (populate: PopulateField[]) => void;
  addPopulate: (populate: PopulateField) => void;
  removePopulate: (field: string) => void;
  setSort: (sort: SortOption[]) => void;
  addSort: (sort: SortOption) => void;
  removeSort: (field: string) => void;
  setFilters: (filters: FilterGroup | null) => void;
  setPagination: (pagination: PaginationOptions) => void;
  setData: (data: unknown[], meta?: unknown) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetQuery: () => void;
}

const initialState: QueryBuilderState = {
  strapiUrl: process.env.NEXT_PUBLIC_STRAPI_URL || '',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  selectedCollection: null,
  contentTypes: [],
  fields: [],
  populate: [],
  sort: [],
  filters: null,
  pagination: {
    page: 1,
    pageSize: 25,
  },
  data: null,
  meta: null,
  loading: false,
  error: null,
};

export const useQueryStore = create<QueryStore>((set) => ({
  ...initialState,

  setConnection: (strapiUrl, apiKey) => set({ strapiUrl, apiKey }),

  setContentTypes: (contentTypes) => set({ contentTypes }),

  setSelectedCollection: (selectedCollection) =>
    set({ selectedCollection, fields: [], populate: [], sort: [], filters: null }),

  setFields: (fields) => set({ fields }),

  addField: (field) =>
    set((state) => ({
      fields: state.fields.includes(field)
        ? state.fields
        : [...state.fields, field],
    })),

  removeField: (field) =>
    set((state) => ({
      fields: state.fields.filter((f) => f !== field),
    })),

  setPopulate: (populate) => set({ populate }),

  addPopulate: (populate) =>
    set((state) => ({
      populate: [...state.populate, populate],
    })),

  removePopulate: (field) =>
    set((state) => ({
      populate: state.populate.filter((p) => p.field !== field),
    })),

  setSort: (sort) => set({ sort }),

  addSort: (sort) =>
    set((state) => {
      const existingIndex = state.sort.findIndex((s) => s.field === sort.field);
      if (existingIndex >= 0) {
        const newSort = [...state.sort];
        newSort[existingIndex] = sort;
        return { sort: newSort };
      }
      return { sort: [...state.sort, sort] };
    }),

  removeSort: (field) =>
    set((state) => ({
      sort: state.sort.filter((s) => s.field !== field),
    })),

  setFilters: (filters) => set({ filters }),

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  setData: (data, meta) => set({ data, meta }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  resetQuery: () =>
    set({
      fields: [],
      populate: [],
      sort: [],
      filters: null,
      pagination: { page: 1, pageSize: 25 },
      data: null,
      meta: null,
      error: null,
    }),
}));
