import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: string;
  keywords?: string;
  schema?: Record<string, unknown>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  image = 'https://comunidademais.app/og-image.jpg',
  type = 'website',
  keywords,
  schema,
}) => {
  const siteUrl = 'https://comunidademais.app';
  const fullTitle = `${title} | ComunidadeMais - Software para Igrejas`;
  const defaultKeywords = 'software para igrejas, sistema para igrejas, gestão de igrejas, gestão de membros, engajamento de membros, portal do membro, site para igreja, igreja online, gestão pastoral, sistema religioso';

  return (
    <Helmet>
      {/* Metatags básicas */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={canonical || siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical || siteUrl} />
      <meta property="og:site_name" content="ComunidadeMais - Software para Igrejas" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Outras metatags importantes */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="theme-color" content="#1976d2" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <html lang="pt-BR" />

      {/* Schema.org markup para Rich Snippets */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 