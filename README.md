The CultureMap frontend is a [Next.js](https://nextjs.org/) project.

## Installation

For productions

```bash
npm ci 
```

For development

```bash
npm i 
```

... and create a file `.env.local` or rename `.env.example` and ensure that the following variables are set

```
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_MAP_JSON_URL=...
PREVIEW_SECRET=...
```

The PREVIEW_SECRET is shared between between API and Frontend and needs to be the same.

## Starting

on the server

```bash
npm run start
```

for development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
