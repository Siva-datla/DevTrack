// backend/src/utils/normalizer.js

/**
 * Maps numerical Codeforces ratings to unified difficulty tiers.
 */
export const mapCodeforcesDifficulty = (rating) => {
  if (!rating) return 'UNRATED';
  if (rating < 1200) return 'EASY';
  if (rating < 1900) return 'MEDIUM';
  return 'HARD';
};

/**
 * Normalizes a raw Codeforces submission into DevTrack format.
 */
export const normalizeCodeforcesSubmission = (rawSub, userId = null) => {
  const problem = rawSub.problem || {};
  const contestId = problem.contestId || rawSub.contestId || null;
  const problemIndex = problem.index || '';
  const problemId = contestId && problemIndex ? `${contestId}${problemIndex}` : (problemIndex || 'UNKNOWN');

  return {
    userId: userId || null,
    platform: 'CODEFORCES',
    platformSubmissionId: String(rawSub.id),
    problemId,
    problemName: problem.name || 'Untitled Problem',
    difficulty: mapCodeforcesDifficulty(problem.rating),
    language: rawSub.programmingLanguage || '',
    verdict: rawSub.verdict === 'OK' ? 'ACCEPTED' : (rawSub.verdict || 'OTHER'),
    // Codeforces timestamps are in seconds; JS Date requires milliseconds
    submittedAt: new Date(Number(rawSub.creationTimeSeconds) * 1000),
    contestId: contestId ? String(contestId) : null,
    problemUrl: contestId && problemIndex ? `https://codeforces.com/contest/${contestId}/problem/${problemIndex}` : null,
  };
};

/**
 * Normalizes a raw LeetCode submission into DevTrack format.
 */
export const normalizeLeetCodeSubmission = (rawSub, userId = null) => {
  return {
    userId: userId || null,
    platform: 'LEETCODE',
    platformSubmissionId: String(rawSub.id),
    problemId: rawSub.titleSlug || 'UNKNOWN',
    problemName: rawSub.title || 'Untitled Problem',
    difficulty: rawSub.difficulty ? String(rawSub.difficulty).toUpperCase() : 'UNRATED',
    language: rawSub.lang || rawSub.programmingLanguage || rawSub.language || '',
    verdict: 'ACCEPTED',
    submittedAt: new Date(Number(rawSub.timestamp) * 1000),
    contestId: null,
    problemUrl: rawSub.titleSlug ? `https://leetcode.com/problems/${rawSub.titleSlug}/` : null,
  };
};


/**
 * Normalizes a raw Codeforces user profile into DevTrack format.
 */
export const normalizeCodeforcesProfile = (rawUser) => {
  if (!rawUser) return null;

  const firstName = rawUser.firstName || '';
  const lastName = rawUser.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;
  const username = rawUser.handle || '';

  return {
    platform: 'CODEFORCES',
    username,
    handle: username,
    name: fullName,
    realName: fullName,
    avatar: rawUser.avatar || rawUser.titlePhoto || null,
    rating: rawUser.rating ?? null,
    maxRating: rawUser.maxRating ?? null,
    rank: rawUser.rank || 'Unrated',
    ranking: rawUser.rank || 'Unrated',
    totalSolved: rawUser.totalSolved ?? null,
    breakdown: {
      easy: rawUser.easySolved ?? null,
      medium: rawUser.mediumSolved ?? null,
      hard: rawUser.hardSolved ?? null,
    },
    profileUrl: username ? `https://codeforces.com/profile/${username}` : null,
  };
};

/**
 * Normalizes a raw LeetCode user profile into DevTrack format.
 */
export const normalizeLeetCodeProfile = (rawUser) => {
  if (!rawUser) return null;

  const username = rawUser.username || '';
  const fullName = rawUser.realName || null;

  return {
    platform: 'LEETCODE',
    username,
    handle: username,
    name: fullName,
    realName: fullName,
    avatar: rawUser.avatar || null,
    rating: rawUser.rating ?? null,
    maxRating: rawUser.maxRating ?? null,
    rank: rawUser.ranking ? `#${rawUser.ranking}` : 'Unranked',
    ranking: rawUser.ranking ?? null,
    totalSolved: rawUser.totalSolved ?? 0,
    breakdown: {
      easy: rawUser.easySolved ?? 0,
      medium: rawUser.mediumSolved ?? 0,
      hard: rawUser.hardSolved ?? 0,
    },
    profileUrl: username ? `https://leetcode.com/${username}` : null,
  };
};


/**
 * Normalizes LeetCode contest ranking and history.
 */
export const normalizeLeetCodeContestRanking = (rawContest) => {
  if (!rawContest) return null;

  const ranking = rawContest.userContestRanking || null;
  const history = rawContest.userContestRankingHistory || [];

  return {
    platform: 'LEETCODE',
    rating: ranking?.rating ? Math.round(ranking.rating) : null,
    globalRanking: ranking?.globalRanking ?? null,
    totalParticipants: ranking?.totalParticipants ?? null,
    topPercentage: ranking?.topPercentage ?? null,
    attendedContestsCount: ranking?.attendedContestsCount ?? 0,
    badge: ranking?.badge?.name ?? null,
    history: history.map((item) => ({
      contestTitle: item.contest?.title || 'Contest',
      startTime: item.contest?.startTime ? new Date(item.contest.startTime * 1000) : null,
      rating: item.rating ? Math.round(item.rating) : null,
      ranking: item.ranking ?? null,
      problemsSolved: item.problemsSolved ?? 0,
      totalProblems: item.totalProblems ?? 0,
      attended: Boolean(item.attended),
    })),
    userContestRanking: ranking,
    userContestRankingHistory: history,
  };
};

/**
 * Normalizes a raw HackerRank challenge submission into DevTrack format.
 */
export const normalizeHackerRankSubmission = (rawChallenge, userId = null) => {
  const slug = rawChallenge.ch_slug || rawChallenge.slug || 'unknown';
  const name = rawChallenge.name || slug;

  return {
    userId: userId || null,
    platform: 'HACKERRANK',
    platformSubmissionId: String(slug),
    problemId: slug,
    problemName: name,
    difficulty: 'UNRATED',
    language: '',
    verdict: 'ACCEPTED',
    submittedAt: rawChallenge.created_at ? new Date(rawChallenge.created_at) : new Date(),
    contestId: rawChallenge.con_slug || null,
    problemUrl: rawChallenge.url ? `https://www.hackerrank.com${rawChallenge.url}` : `https://www.hackerrank.com/challenges/${slug}`,
  };
};

/**
 * Normalizes a raw HackerRank user profile into DevTrack format.
 */
export const normalizeHackerRankProfile = (rawProfile, rawBadges = [], rawScores = []) => {
  if (!rawProfile) return null;

  const username = rawProfile.username || '';
  const fullName = rawProfile.name || null;

  // Calculate total challenges solved across badges
  const totalSolvedFromBadges = Array.isArray(rawBadges)
    ? rawBadges.reduce((sum, b) => sum + (b.solved || 0), 0)
    : 0;

  // Extract score if available
  const topScore = Array.isArray(rawScores)
    ? rawScores.find((s) => s.slug === 'algorithms' || s.slug === 'data-structures' || s.slug === 'python')
    : null;
  const primaryRating = topScore?.practice?.score ? Math.round(topScore.practice.score) : null;
  const primaryRank = topScore?.practice?.rank || null;

  const formattedBadges = Array.isArray(rawBadges)
    ? rawBadges.map((b) => ({
        badgeName: b.badge_name,
        categoryName: b.category_name,
        stars: b.stars,
        totalStars: b.total_stars,
        solved: b.solved,
        points: b.current_points,
        rank: b.hacker_rank,
      }))
    : [];

  return {
    platform: 'HACKERRANK',
    username,
    handle: username,
    name: fullName,
    realName: fullName,
    avatar: rawProfile.avatar || null,
    rating: primaryRating,
    maxRating: null,
    rank: primaryRank ? `#${primaryRank}` : `Level ${rawProfile.level || 1}`,
    ranking: primaryRank,
    totalSolved: totalSolvedFromBadges,
    breakdown: {
      easy: null,
      medium: null,
      hard: null,
    },
    level: rawProfile.level || null,
    country: rawProfile.country || null,
    school: rawProfile.school || null,
    badges: formattedBadges,
    profileUrl: username ? `https://www.hackerrank.com/${username}` : null,
  };
};

/**
 * Unified helper to normalize a submission based on platform.
 */
export const normalizeSubmission = (platform, rawSub, userId = null) => {
  if (!rawSub) return null;
  const normalizedPlatform = String(platform || '').toUpperCase();

  if (normalizedPlatform === 'CODEFORCES') {
    return normalizeCodeforcesSubmission(rawSub, userId);
  }
  if (normalizedPlatform === 'LEETCODE') {
    return normalizeLeetCodeSubmission(rawSub, userId);
  }
  if (normalizedPlatform === 'HACKERRANK') {
    return normalizeHackerRankSubmission(rawSub, userId);
  }
  return rawSub;
};

/**
 * Unified helper to normalize user profile based on platform.
 */
export const normalizeUserProfile = (platform, rawUser, rawBadges = [], rawScores = []) => {
  if (!rawUser) return null;
  const normalizedPlatform = String(platform || '').toUpperCase();

  if (normalizedPlatform === 'CODEFORCES') {
    return normalizeCodeforcesProfile(rawUser);
  }
  if (normalizedPlatform === 'LEETCODE') {
    return normalizeLeetCodeProfile(rawUser);
  }
  if (normalizedPlatform === 'HACKERRANK') {
    return normalizeHackerRankProfile(rawUser, rawBadges, rawScores);
  }
  return rawUser;
};

// Aliases for versatility
export const normalizeCodeforcesUser = normalizeCodeforcesProfile;
export const normalizeLeetCodeUser = normalizeLeetCodeProfile;
export const normalizeHackerRankUser = normalizeHackerRankProfile;
export const normalizeProfile = normalizeUserProfile;
export const normalizeUser = normalizeUserProfile;

// Unified callable normalize function with attached methods
export const normalize = (platform, data) => normalizeUserProfile(platform, data);
normalize.codeforcesProfile = normalizeCodeforcesProfile;
normalize.leetcodeProfile = normalizeLeetCodeProfile;
normalize.hackerrankProfile = normalizeHackerRankProfile;
normalize.codeforcesUser = normalizeCodeforcesProfile;
normalize.leetcodeUser = normalizeLeetCodeProfile;
normalize.hackerrankUser = normalizeHackerRankProfile;
normalize.userProfile = normalizeUserProfile;
normalize.profile = normalizeUserProfile;
normalize.codeforcesSubmission = normalizeCodeforcesSubmission;
normalize.leetcodeSubmission = normalizeLeetCodeSubmission;
normalize.hackerrankSubmission = normalizeHackerRankSubmission;
normalize.submission = normalizeSubmission;
normalize.leetcodeContestRanking = normalizeLeetCodeContestRanking;

export default normalize;