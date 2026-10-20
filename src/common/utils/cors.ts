const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

// Production only trusts the real website origins; localhost/LAN origins are
// for development builds only.
export function getAllowedOrigins(): string[] {
  const production = process.env.NODE_ENV === 'production';
  return [
    ...new Set(
      [
        process.env.WEB_APP_URL,
        ...(production ? ['https://iitrade.org', 'https://app.iitrade.org'] : DEV_ORIGINS),
      ].filter((origin): origin is string => Boolean(origin)),
    ),
  ];
}
