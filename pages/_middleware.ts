import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { appConfig } from "~/config";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.url) {
    const url = new URL(req.url);

    if (url.pathname !== "/") {
      const parts = url.pathname.split("/");

      if (parts?.length === 2) {
        const file = parts[1];

        if (file.indexOf("sitemap") !== -1 && file.indexOf(".xml") !== -1) {
          let status = 200;
          const contentType = "application/xml; charset=UTF-8";

          let body = await fetch(`${appConfig.apiUrl}/sitemap/${file}`)
            .then((response: Response) => {
              if (response) {
                status = response.status;

                return response.text();
              }
              return null;
            })
            .then((body) => body)
            .catch((err) => {
              status = 500;
              return "Internal server error";
            });

          return new Response(body, {
            status,
            headers: {
              expires: "Mon, 23 Jul 1997 05:00:00 GMT",
              "cache-control": "no-cache, must-revalidate",
              "content-type": contentType,
            },
          });
        }
      }
    }
  }
  return NextResponse.next();
}
