export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export interface RateLimiter {
  consume(key: string, now?: number): RateLimitDecision;
}

type RateLimitBucket = {
  attempts: number[];
  lastSeen: number;
};

export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();
  private operations = 0;

  constructor(
    private readonly maximumAttempts = 5,
    private readonly windowMilliseconds = 15 * 60 * 1000,
  ) {}

  consume(key: string, now = Date.now()): RateLimitDecision {
    this.operations += 1;
    if (this.operations % 100 === 0) this.prune(now);

    const cutoff = now - this.windowMilliseconds;
    const bucket = this.buckets.get(key) ?? { attempts: [], lastSeen: now };
    bucket.attempts = bucket.attempts.filter((attempt) => attempt > cutoff);
    bucket.lastSeen = now;

    if (bucket.attempts.length >= this.maximumAttempts) {
      this.buckets.set(key, bucket);
      const retryAfterMilliseconds = Math.max(1, bucket.attempts[0] + this.windowMilliseconds - now);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(retryAfterMilliseconds / 1000),
      };
    }

    bucket.attempts.push(now);
    this.buckets.set(key, bucket);
    return {
      allowed: true,
      remaining: Math.max(0, this.maximumAttempts - bucket.attempts.length),
      retryAfterSeconds: 0,
    };
  }

  private prune(now: number) {
    const staleBefore = now - this.windowMilliseconds;
    for (const [key, bucket] of this.buckets) {
      if (bucket.lastSeen <= staleBefore) this.buckets.delete(key);
    }
  }
}
