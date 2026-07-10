import { Helmet } from 'react-helmet-async';

// TODO: Add a real image at public/og-default.png for the default Open Graph image.

const SEO = ({ title, description, keywords, ogImage, canonicalUrl }) => {
  const defaultTitle = 'HomeTutorX | Find Verified Home & Online Tutors';
  const defaultDesc = 'Connect with top-rated, qualified home and online tutors for CBSE, ICSE, Boards, JEE, NEET, and university courses.';
  const siteTitle = title ? `${title} | HomeTutorX` : defaultTitle;
  const siteDesc = description || defaultDesc;

  // Base URL (fallback to explicit domain if env var is missing)
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.hometutorx.in';
  // Default Open Graph image (assumes public/og-default.png exists)
  const defaultOgImage = `${siteUrl}/og-default.png`;
  const finalOgImage = ogImage || defaultOgImage;
  // Canonical URL (fallback to current pathname)
  const canonical = canonicalUrl || `${siteUrl}${window.location.pathname}`;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDesc} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDesc} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Canonical link */}
      <link rel="canonical" href={canonical} />

      {/* Organization JSON‑LD */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "url": "${siteUrl}",
            "name": "HomeTutorX",
            "logo": "${siteUrl}/logo.png"
          }
        `}
      </script>
    </Helmet>
  );
};

export default SEO;
