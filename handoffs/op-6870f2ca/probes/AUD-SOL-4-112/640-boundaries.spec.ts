// Audit-only service acceptance probes, no live database.
import { ProgramLibraryService } from '../src/workout-builder/program-library.service';
import type { PrismaService } from '../src/prisma.service';
import type { WorkoutBuilderService } from '../src/workout-builder/workout-builder.service';
import type { ProgramDeliveryService } from '../src/workout-builder/program-delivery.service';

function fake<T>(value: unknown): T { return value as T; }

it('B-640-2: sub-coach A must not see sub-coach B client names and workout progress', async () => {
  const p = {
    user: {
      findUnique: jest.fn(async () => ({id:'sub-a', role:'coach', coach_id:'head'})),
      findMany: jest.fn(async () => [{id:'client-b', name:'Private client B'}]),
    },
    workoutProgram: {
      findFirst: jest.fn(async () => ({id:'master', coach_id:'head', visibility:'tenant_shared', owner_user_id:'head'})),
      findMany: jest.fn(async () => [{
        id:'copy-b', plans:[{assignments:[{
          client_id:'client-b', scheduled_for:new Date('2026-10-05T12:00:00Z'), completed_at:new Date(),
        }]}],
      }]),
    },
  };
  const wb = { assertCanAccessClient: jest.fn(async () => { throw new Error('client-b is outside sub-a scope'); }) };
  const svc = new ProgramLibraryService(fake<PrismaService>(p), fake<WorkoutBuilderService>(wb), fake<ProgramDeliveryService>({}));
  expect((await svc.listAssignees('sub-a','master')).items).toEqual([]);
});

it('C-640-8: delivery keys for two different masters must not collide', async () => {
  const tx = {
    $executeRaw: jest.fn(async () => 1),
    workoutProgram: {
      findUnique: jest.fn(async () => null),
      findFirst: jest.fn(async () => null),
    },
  };
  const p = {
    user: { findUnique: jest.fn(async () => ({id:'head',role:'coach',coach_id:null})) },
    workoutProgram: { findFirst: jest.fn(async (args: {where: {id: string}}) => ({id:args.where.id,archived_at:null})) },
    workoutPlan: { count: jest.fn(async () => 1) },
    $transaction: jest.fn(async (fn: (db: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  const deliverInTx = jest.fn(async (_tx: unknown, input: {masterProgramId:string}) => ({
    program_id: input.masterProgramId, assignment_ids:['a1'], replayed:false,
    first_scheduled_for:'2026-10-05T12:00:00Z', last_scheduled_for:'2026-10-05T12:00:00Z',
  }));
  const svc = new ProgramLibraryService(
    fake<PrismaService>(p),
    fake<WorkoutBuilderService>({assertCanAccessClient: jest.fn(async () => undefined)}),
    fake<ProgramDeliveryService>({deliverInTx}),
  );
  const dto = {client_ids:['client'],start_date:'2026-10-05'};
  await svc.bulkAssign('head','master-a',dto,'same-key');
  await svc.bulkAssign('head','master-b',dto,'same-key');
  const calls = fake<Array<[unknown,{deliveryKey:string}]>>(deliverInTx.mock.calls);
  expect(calls[0][1].deliveryKey).not.toBe(calls[1][1].deliveryKey);
});
