import type { User } from '@prisma/client';
import type { PrismaService } from '../../../src/prisma.service';
import { CommunityModerationService } from '../../../src/community/moderation/community-moderation.service';
import { CommunityModerationRepository } from '../../../src/community/moderation/community-moderation.repository';
import { CommunityAccessService } from '../../../src/community/community-access.service';
import { CommunityMessagesRepository } from '../../../src/community/messages/community-messages.repository';
import { CommunityPostsRepository } from '../../../src/community/posts/community-posts.repository';
import type { CommunityRealtimeService } from '../../../src/community/realtime/community-realtime.service';
import type { CommunityNotificationsService } from '../../../src/community/notifications/community-notifications.service';
import type { VoiceUploadProvider } from '../../../src/community/voice/voice-upload.provider';
import { InMemoryPrisma } from './in-memory-prisma';

function stub<T>(v: object): T { return v as T; }
const COACH = '11111111-1111-4111-8111-111111111111';
const MEMBER = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const TARGET = '55555555-5555-4555-8555-555555555555';
const REPORT = '66666666-6666-4666-8666-666666666666';
it.each(['post', 'message', 'win', 'voice_note'] as const)(
  'AUD-SOL7: %s enforcement rolls back on notice failure, then retries once',
  async (targetType) => {
    const db = new InMemoryPrisma();
    const coach = stub<User>(db.seed('user', { id: COACH, role: 'coach', coach_id: null }));
    db.seed('user', { id: MEMBER, role: 'student', coach_id: COACH });
    db.seed('communityWorkspace', { id: WORKSPACE, coach_id: COACH, archived_at: null });
    db.seed('communityMembership', { workspace_id: WORKSPACE, cohort_id: 'cohort', user_id: MEMBER, status: 'active' });
    const tables = {
      post: 'communityPost', message: 'communityMessage',
      win: 'communityWin', voice_note: 'communityVoiceNote',
    };
    const content = db.seed(tables[targetType], {
      id: TARGET, workspace_id: WORKSPACE, author_id: MEMBER, sender_id: MEMBER,
      user_id: MEMBER, storage_key: '44444444-4444-4444-8444-444444444444/1700000000000-0123456789abcdef.m4a',
    });
    db.seed('communityModerationAction', { id: REPORT, workspace_id: WORKSPACE, target_type: targetType, target_id: TARGET, status: 'open', reported_by_id: MEMBER, reason: 'other' });
    const prisma = stub<PrismaService>(db);
    const realTx = db.$transaction.bind(db);
    const rejectNotice = jest.spyOn(db, '$transaction').mockImplementation(async (fn) =>
      realTx(async (tx) => fn(new Proxy(tx, {
        get: (obj, prop: string) => prop === 'notification'
          ? { findMany: async () => [], create: async () => { throw new Error('AUD-SOL7 notice insert unavailable'); } }
          : Reflect.get(obj, prop),
      }))),
    );
    const remove = jest.fn(async () => ({ removed: 1, failed: false }));
    const push = jest.fn(async () => undefined);
    const svc = new CommunityModerationService(
      new CommunityAccessService(prisma), new CommunityModerationRepository(prisma),
      new CommunityMessagesRepository(prisma), new CommunityPostsRepository(prisma),
      stub<CommunityRealtimeService>({
        channels: { moderation: () => 'moderation' },
        broadcastCommunityEvent: jest.fn(async () => undefined),
      }), stub<CommunityNotificationsService>({ sendCommunityPush: push }), prisma,
      stub<VoiceUploadProvider>({ bucket: () => 'voice-notes', removeObjects: remove, objectGone: async () => true }),
    );
    await expect(svc.act(coach, REPORT, 'ban', undefined)).rejects.toThrow('AUD-SOL7 notice insert unavailable');
    expect(db.table('communityWorkspaceBan')).toHaveLength(0);
    expect(db.table('communityMembership')[0].status).toBe('active');
    expect(db.table('communityModerationAction')[0]).toMatchObject({ status: 'open', action: null });
    expect(db.table('notification')).toHaveLength(0);
    expect(db.table('communityVoiceErasure')).toHaveLength(0);
    expect(content.deleted_at ?? content.hidden_at ?? content.soft_deleted_at ?? null).toBeNull();
    expect(remove).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    rejectNotice.mockRestore();
    await expect(svc.act(coach, REPORT, 'ban', undefined)).resolves.toMatchObject({
      item: { action: 'ban', status: 'actioned' }, member_notice: { stored: true },
    });
    await svc.act(coach, REPORT, 'ban', undefined);
    expect(db.table('communityWorkspaceBan')).toHaveLength(1);
    expect(db.table('notification')).toHaveLength(1);
    expect(push).toHaveBeenCalledTimes(1);
  },
);
