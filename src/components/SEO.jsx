import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'DLPZ Shortener - Raccourcisseur d\'URLs | Dorian Lopez',
  description = 'Raccourcissez vos URLs rapidement et facilement avec DLPZ Shortener. Service gratuit, sécurisé et moderne créé par Dorian Lopez.',
  keywords = 'raccourcisseur url, raccourcir lien, url court, dlpz, dorian lopez, lien court, raccourcissement url',
  image = 'https://dorianlopez.fr/avatar.png',
  url = 'https://dlpz.fr',
  type = 'website',
  author = 'Dorian Lopez',
  twitterHandle = '@winvdaking',
  linkedinHandle = 'winvdaking',
}) {
  useEffect(() => {
    // Mise à jour dynamique du titre de la page
    document.title = title;

    // Mise à jour des meta tags Open Graph
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('property', 'og:url', url);
    updateMetaTag('property', 'og:type', type);

    // Mise à jour des meta tags Twitter
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);
    updateMetaTag('name', 'twitter:url', url);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:creator', twitterHandle);
    updateMetaTag('name', 'twitter:site', twitterHandle);

    // Mise à jour des meta tags LinkedIn
    updateMetaTag('property', 'linkedin:title', title);
    updateMetaTag('property', 'linkedin:description', description);
    updateMetaTag('property', 'linkedin:image', image);
    updateMetaTag('property', 'linkedin:owner', linkedinHandle);

    // Mise à jour des meta tags génériques
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('name', 'author', author);

    // Mise à jour du canonical
    updateCanonical(url);
  }, [
    title,
    description,
    keywords,
    image,
    url,
    type,
    author,
    twitterHandle,
    linkedinHandle,
  ]);

  const updateMetaTag = (attribute, value, content) => {
    let meta = document.querySelector(`meta[${attribute}="${value}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, value);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  const updateCanonical = (url) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Dorian Lopez - dlpz.fr" />
      <meta property="og:site_name" content="dlpz.fr" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:site" content={twitterHandle} />

      {/* LinkedIn */}
      <meta property="linkedin:title" content={title} />
      <meta property="linkedin:description" content={description} />
      <meta property="linkedin:image" content={image} />
      <meta property="linkedin:owner" content={linkedinHandle} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'dlpz.fr',
          description: description,
          url: url,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Web Browser',
          author: {
            '@type': 'Person',
            name: 'Dorian Lopez',
            url: 'https://dorianlopez.fr',
            image: 'https://dorianlopez.fr/avatar.png',
          },
          creator: {
            '@type': 'Person',
            name: 'Dorian Lopez',
            url: 'https://dorianlopez.fr',
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
          },
          featureList: [
            'Raccourcissement d\'URLs',
            'Interface moderne',
            'Thème sombre/clair',
            'Design responsive',
            'API REST',
          ],
        })}
      </script>
    </Helmet>
  );
}
