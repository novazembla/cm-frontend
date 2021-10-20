import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (
    req.query.secret !== process.env.PREVIEW_SECRET ||
    !req.query.slug ||
    !req.query.token
  ) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // TODO: Maybe secure this a little bit more

  /*
  // Fetch the headless CMS to check if the provided `slug` exists
  // getPostBySlug would implement the required fetching logic to the headless CMS
  const post = await getPostBySlug(req.query.slug)

  // If the slug doesn't exist prevent preview mode from being enabled
  if (!post) {
    return res.status(401).json({ message: 'Invalid slug' })
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({})

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  res.redirect(post.slug)
  */

  // Enable Preview Mode by setting the cookies
  res.setPreviewData(
    {
      accessToken: req.query.token,
    },
    {
      maxAge: 60 * 60, // The preview mode cookies expire in 1 hour
    }
  );

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  res.redirect(req.query.slug as string);
}
