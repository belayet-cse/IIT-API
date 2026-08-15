export function getAllowedOrigins(): string[] {
  return [
    ...new Set(
      [
        process.env.WEB_APP_URL,
        'https://iit.belayetsust.com',
        'http://localhost:3000',
        'http://192.168.0.150:3000',
      ].filter((origin): origin is string => Boolean(origin)),
    ),
  ];
}
