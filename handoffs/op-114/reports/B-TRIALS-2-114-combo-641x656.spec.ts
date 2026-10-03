import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { PackagesService } from '../src/packages/packages.service';

describe('combo #641 x #656: Idempotency-Key create applies trial rules', () => {
  const tx = {
    workoutBuilderIdempotencyKey: { create: jest.fn(async () => ({ id: 'c1' })), update: jest.fn(async () => ({})) },
    coachPackage: { create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'pkg', ...data })) },
  };
  const prisma = { ...tx, $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)) };
  const svc = Reflect.construct(PackagesService, [prisma, {}, {}]);
  const base = { name: 'Pro', amount_cents: 4900, billing_type: 'recurring' as const, interval: 'month' as const };
  it('refuses 45 days with a key', async () => {
    await expect(svc.createIdempotent('coach', { ...base, trial_days: 45 }, 'key-12345678')).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.coachPackage.create).not.toHaveBeenCalled();
  });
  it('refuses a trial on one-time with a key', async () => {
    await expect(svc.createIdempotent('coach', { ...base, billing_type: 'one_time', trial_days: 7 }, 'key-12345679')).rejects.toBeInstanceOf(BadRequestException);
  });
  it('stores 7 days with a key', async () => {
    const out = await svc.createIdempotent('coach', { ...base, trial_days: 7 }, 'key-12345670');
    expect(out.pkg.trial_days).toBe(7);
  });
});
