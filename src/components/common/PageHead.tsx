import Head from "next/head";

const SITE_NAME = "Jyotishya Darshan";
const DEFAULT_DESCRIPTION =
  "Vedic horoscope, Kundli, Dasha, Dosha check, marriage match, and Panchang. Try free without login.";

type Props = {
  title?: string;
  description?: string;
};

export default function PageHead({ title, description = DEFAULT_DESCRIPTION }: Props) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
    </Head>
  );
}
