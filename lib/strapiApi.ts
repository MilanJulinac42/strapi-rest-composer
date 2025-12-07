import axios from 'axios';
import type { StrapiContentType, StrapiResponse, StrapiError } from './types';

export class StrapiApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Fetch all content types from Strapi
   * Note: This requires admin API access in Strapi v5
   */
  async fetchContentTypes(): Promise<StrapiContentType[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/content-type-builder/content-types`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      // Extract content types from the response
      const contentTypes = response.data.data || [];

      // Filter to only include API content types (exclude plugins and admin)
      // API content types have UIDs starting with "api::"
      const apiContentTypes = contentTypes.filter(
        (ct: StrapiContentType) => ct.uid && ct.uid.startsWith('api::')
      );

      // Fetch detailed schema for each content type to get attributes
      const detailedContentTypes = await Promise.all(
        apiContentTypes.map(async (ct: StrapiContentType) => {
          try {
            const schemaResponse = await axios.get(
              `${this.baseUrl}/api/content-type-builder/content-types/${ct.uid}`,
              {
                headers: {
                  Authorization: `Bearer ${this.apiKey}`,
                },
              }
            );

            const responseData = schemaResponse.data.data;

            // Extract schema data - attributes are nested in schema property
            return {
              uid: responseData.uid,
              apiID: responseData.apiID,
              kind: responseData.schema?.kind || 'collectionType',
              info: {
                singularName: responseData.schema?.singularName || '',
                pluralName: responseData.schema?.pluralName || '',
                displayName: responseData.schema?.displayName || responseData.apiID,
                description: responseData.schema?.description,
              },
              options: {
                draftAndPublish: responseData.schema?.draftAndPublish,
              },
              attributes: responseData.schema?.attributes || {},
            };
          } catch (error) {
            console.error(`Failed to fetch schema for ${ct.uid}:`, error);
            return ct; // Return basic info if detailed fetch fails
          }
        })
      );

      return detailedContentTypes;
    } catch (error) {
      console.error('Error fetching content types:', error);

      // If admin API is not accessible, return empty array
      // This allows the app to still function in manual mode
      return [];
    }
  }

  /**
   * Execute a query against Strapi API
   */
  async executeQuery<T = unknown>(
    collection: string,
    queryString: string
  ): Promise<StrapiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api/${collection}${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get<StrapiResponse<T>>(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const strapiError = error.response.data as StrapiError;
        throw new Error(
          strapiError.error?.message || 'Failed to execute query'
        );
      }
      throw error;
    }
  }

  /**
   * Test connection to Strapi
   */
  async testConnection(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
