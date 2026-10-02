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
import { VoiceUploadProvider as RealVoiceUploadProvider } from '../../../src/community/voice/voice-upload.provider';
import type { SupabaseService } from '../../../src/supabase/supabase.service';
import { attemptVoiceErasures, recordVoiceErasures } from '../../../src/community/voice/voice-erasure';
function stub<T>(v: object): T { return v as T; }
it('AUD-SOL: a failed notice transaction cannot leave a member silently banned', async () => {
  const db = new InMemoryPrisma();
  const coach = stub<User>(db.seed('user', { id: 'coach', role: 'coach', coach_id: null }));
  db.seed('user', { id: 'member', role: 'student', coach_id: 'coach' });
  db.seed('communityWorkspace', { id: 'ws', coach_id: 'coach', archived_at: null });
  db.seed('communityMembership', { workspace_id: 'ws', cohort_id: 'cohort', user_id: 'member', status: 'active' });
  db.seed('communityPost', { id: 'post', workspace_id: 'ws', author_id: 'member' });
  db.seed('communityModerationAction', { id: 'report', workspace_id: 'ws', target_type: 'post', target_id: 'post', status: 'open' });
  const prisma = stub<PrismaService>(db);
  // Reject at the transaction boundary: no resolution or notice can commit.
  const original = db.$transaction.bind(db);
  prisma.$transaction = stub<typeof prisma.$transaction>(
    jest.fn(original).mockImplementationOnce(original).mockImplementationOnce(async () => { throw new Error('notice transaction unavailable'); }),
  );
  const svc = new CommunityModerationService(
    new CommunityAccessService(prisma), new CommunityModerationRepository(prisma),
    new CommunityMessagesRepository(prisma), new CommunityPostsRepository(prisma),
    stub<CommunityRealtimeService>({}), stub<CommunityNotificationsService>({}), prisma,
    stub<VoiceUploadProvider>({}),
  );
  await expect(svc.act(coach, 'report', 'ban', undefined)).rejects.toThrow('notice transaction unavailable');
  expect(db.table('communityWorkspaceBan')).toHaveLength(0);
  expect(db.table('communityMembership')[0].status).toBe('active');
  expect(db.table('communityPost')[0].deleted_at).toBeNull();
});

it('AUD-SOL: ambiguous storage HTTP 400 cannot certify a recording erased', async () => {
  const db = new InMemoryPrisma();
  const prisma = stub<PrismaService>(db);
  const storage = new RealVoiceUploadProvider(stub<SupabaseService>({
    getClient: () => ({
      storage: { from: () => ({
        info: async () => ({ data: null, error: { statusCode: '400', message: 'Bad request' } }),
      }) },
    }),
  }));
  jest.spyOn(storage, 'removeObjects').mockResolvedValue({ removed: 0, failed: true });
  const key = '44444444-4444-4444-4444-444444444444/1700000000000-0123456789abcdef.m4a';
  const work = await recordVoiceErasures(prisma, [{ kind: 'object', target: key }], 'account_deletion');
  expect(await attemptVoiceErasures(prisma, storage, work)).toEqual({ completed: 0, pending: 1 });
  expect(db.table('communityVoiceErasure')[0].completed_at).toBeNull();
});
