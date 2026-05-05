import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

const SITE_NAME = "Sarafina";
const SITE_TITLE = "Sarafina • Confident African Flavours";
const DEFAULT_DESCRIPTION =
  "Discover authentic African flavours with Sarafina. Shop our range of high-quality groceries, spices, and pantry essentials delivered within Zimbabwe.";
const TWITTER_HANDLE = "@SarafinaStore";

export const SEO = ({
  title,
  description,
  image,
  url,
  type = "website",
  keywords,
  canonical,
  noindex = false,
  structuredData,
}: SEOProps) => {
  const siteUrl = window.location.origin;
  const defaultImage = `${siteUrl}/images/og-image.jpg`;

  const seoTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  const seoDescription = description || DEFAULT_DESCRIPTION;
  const seoImage = image || defaultImage;
  const seoUrl = url || window.location.href;
  const seoCanonical = canonical || seoUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={seoCanonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seoTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:url" content={seoUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
