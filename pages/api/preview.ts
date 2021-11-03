import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (
    req.query.secret !== process.env.PREVIEW_SECRET ||
    !req.query.slug ||
    !req.query.token
  ) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData(
    {
      accessToken: req.query.token,
    },
    {
      maxAge: 60 * 15, // The preview mode cookies expires in 15 minutes hour
    }
  );

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  res.redirect(req.query.slug as string);
}
