The CultureMap frontend is a [Next.js](https://nextjs.org/) project.

## Installation

For production

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

The PREVIEW_SECRET is shared between between backend and front end and needs to be the same.

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


## Bundle Size Optimization 
First of all that barrel index.ts files might confuse the nextjs compiler. Sometimes it's better to access other files directly. However, we've enabled `"sideEffects":false,` to the `package.json` to ensure that webpack does as much treeshaking as it can. 

You can inspect the created bundle by running `npm run build:analyze`

We also recommend to make use of [bundle-wizard](https://www.npmjs.com/package/bundle-wizard). To be able to do that you should make sure that `productionBrowserSourceMaps: true,` is set to true in `next.config.js`, then run `npm run build` followed by `PORT=3001 npx next start` (to serve the just built app locally on a different port as bundle-wizard does use port 3000). Then run `npx bundle-wizard http://localhost:3001` to inspect the individual pages. 

!!! Don't forget to set `productionBrowserSourceMaps` to `false` again.

