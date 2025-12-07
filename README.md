# Strapi REST Query Builder UI

A Next.js application that serves as a visual Query Builder for Strapi v5 REST API endpoints. This tool simplifies the manual and complex process of constructing URL query strings for deep population, field selection, sorting, filtering, and pagination.

## Features

- **Visual Query Building**: Intuitive UI for constructing complex Strapi queries
- **Collection Selection**: Auto-detects and lists available content types from your Strapi instance
- **Field Selection**: Choose specific fields to return in the response
- **Deep Population**: Configure relation population with nested support
- **Advanced Filtering**: Build complex filters with multiple operators ($eq, $contains, $in, etc.)
- **Sorting**: Multi-field sorting with ascending/descending options
- **Pagination**: Support for both page-based and offset-based pagination
- **Live URL Preview**: See the generated query URL in real-time
- **Query Execution**: Execute queries directly and view formatted results
- **Copy to Clipboard**: Easy copy for both full URLs and query strings

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **axios** for API interaction
- **zustand** for state management

## Project Structure

```
strapi-rest-composer/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page with two-column layout
├── components/
│   ├── CollectionSelector.tsx   # Collection dropdown
│   ├── FieldSelector.tsx        # Field selection
│   ├── PopulateBuilder.tsx      # Relation population
│   ├── FilterBuilder.tsx        # Query filters
│   ├── SortBuilder.tsx          # Sorting configuration
│   ├── PaginationControls.tsx   # Pagination settings
│   ├── QueryPreview.tsx         # URL preview & execution
│   └── ResultsDisplay.tsx       # Results viewer
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── strapiApi.ts          # Strapi API service
│   └── queryBuilder.ts       # Query string builder
├── store/
│   └── queryStore.ts         # Zustand state management
└── public/                   # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A running Strapi v5 instance
- Strapi API token with appropriate permissions

### Installation

1. **Clone and install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure environment variables**:

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
   NEXT_PUBLIC_API_KEY=your_strapi_api_token_here
   ```

   Replace:
   - `http://localhost:1337` with your Strapi instance URL
   - `your_strapi_api_token_here` with your Strapi API token

### Getting a Strapi API Token

1. Log into your Strapi admin panel
2. Go to **Settings** → **API Tokens**
3. Click **Create new API Token**
4. Configure:
   - **Name**: Query Builder
   - **Token duration**: Unlimited (or as needed)
   - **Token type**: Full access or Custom (with read permissions)
5. Copy the generated token and add it to `.env.local`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Usage Guide

### 1. Select a Collection

Choose a content type from the dropdown. The app will auto-populate available collections from your Strapi instance.

### 2. Configure Query Options

**Fields**: Select specific fields to return (leave empty for all fields)

**Populate**: Add relations to populate in the response
- Use `*` to populate all first-level relations
- Add specific relation names for controlled population

**Filters**: Build complex filters
- Select a field
- Choose an operator ($eq, $contains, $in, etc.)
- Enter the value
- Multiple filters are combined with $and

**Sort**: Add sorting criteria
- Select field and direction (asc/desc)
- Order matters - first sort takes priority

**Pagination**: Configure pagination
- **Page/PageSize**: For page-based pagination
- **Start/Limit**: For offset-based pagination

### 3. Preview & Execute

- **Query Preview**: Shows the generated URL and query string
- **Copy**: Click to copy URL or query string to clipboard
- **Execute Query**: Runs the query against your Strapi instance
- **Results**: View the JSON response with pagination info

## Example Queries

### Basic Query
```
GET /api/articles?fields=title,description&pagination[page]=1&pagination[pageSize]=10
```

### With Population
```
GET /api/articles?populate={"author":true,"categories":true}
```

### With Filters
```
GET /api/articles?filters={"$and":[{"title":{"$contains":"Hello"}},{"published":{"$eq":true}}]}
```

### Complex Query
```
GET /api/articles?
  fields=title,content&
  populate={"author":{"populate":{"avatar":true}}}&
  filters={"category":{"$eq":"tech"}}&
  sort=publishedAt:desc&
  pagination[page]=1&
  pagination[pageSize]=20
```

## Strapi v5 Query Syntax

This tool follows [Strapi v5 REST API conventions](https://docs.strapi.io/dev-docs/api/rest):

- **Fields**: `fields=field1,field2`
- **Populate**: `populate={"relation":true}` or `populate=*`
- **Filters**: `filters={"field":{"$operator":"value"}}`
- **Sort**: `sort=field:asc` or `sort=field:desc`
- **Pagination**: `pagination[page]=1&pagination[pageSize]=25`

## Troubleshooting

### No Collections Showing

- Verify your `NEXT_PUBLIC_STRAPI_URL` is correct
- Check that your API token has permission to access content-type-builder
- Ensure your Strapi instance is running

### Query Execution Fails

- Verify the API token has read permissions for the collection
- Check if the collection has proper access controls in Strapi
- Ensure the query syntax is valid for Strapi v5

### CORS Errors

If you see CORS errors, configure your Strapi instance to allow requests from `http://localhost:3000`:

In Strapi's `config/middlewares.js`:
```javascript
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'http:', 'https:'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
    },
  },
  // ... other middlewares
];
```

## Future Enhancements

- [ ] Deep populate builder with visual tree
- [ ] Save/load query presets
- [ ] Export queries as code snippets (JavaScript, Python, cURL)
- [ ] Advanced filter groups ($or, nested conditions)
- [ ] Response data table view
- [ ] Query history
- [ ] Dark mode
- [ ] Multi-environment support

## License

Private
