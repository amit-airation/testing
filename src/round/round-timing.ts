export function elapsedSinceStartMs(
  startedAt: Date | null,
  at: Date = new Date(),
  stoppedAt: Date | null = null,
): number | null {
  if (!startedAt) {
    return null;
  }

  const end = stoppedAt ?? at;
  return Math.max(0, end.getTime() - startedAt.getTime());
}

export function roundLimitMs(timeLimitSeconds: number): number {
  return timeLimitSeconds * 1000;
}

export function isRoundExpired(
  round: {
    startedAt: Date | null;
    stoppedAt: Date | null;
    timeLimitSeconds: number;
  },
  at: Date = new Date(),
): boolean {
  const elapsedMs = elapsedSinceStartMs(round.startedAt, at, round.stoppedAt);
  if (elapsedMs == null) {
    return false;
  }

  return elapsedMs >= roundLimitMs(round.timeLimitSeconds);
}

export function withRoundTiming<
  T extends {
    startedAt: Date | null;
    stoppedAt: Date | null;
    timeLimitSeconds: number;
    status: string;
  },
>(round: T, at: Date = new Date()) {
  const elapsedMs = elapsedSinceStartMs(round.startedAt, at, round.stoppedAt);
  const limitMs = roundLimitMs(round.timeLimitSeconds);
  const remainingMs =
    elapsedMs == null ? null : Math.max(0, limitMs - elapsedMs);

  return {
    ...round,
    elapsedMs,
    remainingMs,
    expired: isRoundExpired(round, at),
  };
}
