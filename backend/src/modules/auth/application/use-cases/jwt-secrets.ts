export function getRefreshTokenSecret(): string | undefined {
  return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;
}
