import axios from 'axios';

/**
 * Service for communicating with LeetCode's public GraphQL API.
 */
export class LeetCodeService {
  static GRAPHQL_URL = 'https://leetcode.com/graphql';

  /**
   * Helper: Send a GraphQL query to LeetCode
   */
  static async sendGraphQL(query, variables = {}, operationName = undefined) {
    const payload = { query, variables };
    if (operationName) {
      payload.operationName = operationName;
    }

    try {
      const response = await axios.post(this.GRAPHQL_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://leetcode.com',
          'User-Agent': 'DevTrack-Agent/1.0',
        },
      });

      const data = response.data;

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'LeetCode GraphQL error');
      }

      return data.data;
    } catch (error) {
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors[0]?.message || 'LeetCode GraphQL error');
      }
      throw error;
    }
  }

  /**
   * Fetch public profile and solved statistics (Easy, Medium, Hard, Total).
   * @param {string} username - LeetCode username
   */
  static async getUserProfile(username) {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const data = await this.sendGraphQL(query, { username });

    if (!data.matchedUser) {
      throw new Error(`LeetCode user "${username}" not found`);
    }

    const { matchedUser } = data;
    const stats = matchedUser.submitStatsGlobal.acSubmissionNum;

    const allSolved = stats.find((s) => s.difficulty === 'All')?.count || 0;
    const easySolved = stats.find((s) => s.difficulty === 'Easy')?.count || 0;
    const mediumSolved = stats.find((s) => s.difficulty === 'Medium')?.count || 0;
    const hardSolved = stats.find((s) => s.difficulty === 'Hard')?.count || 0;

    return {
      username: matchedUser.username,
      realName: matchedUser.profile.realName,
      avatar: matchedUser.profile.userAvatar,
      ranking: matchedUser.profile.ranking,
      totalSolved: allSolved,
      easySolved,
      mediumSolved,
      hardSolved,
    };
  }

  static questionCache = new Map();

  /**
   * Fetch question details (difficulty and topicTags) by titleSlug (cached).
   */
  static async getQuestionDetails(titleSlug) {
    if (!titleSlug) return { difficulty: 'UNRATED', tags: [] };
    if (this.questionCache.has(titleSlug)) {
      return this.questionCache.get(titleSlug);
    }

    try {
      const query = `
        query getQuestionDetails($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            difficulty
            topicTags {
              name
              slug
            }
          }
        }
      `;
      const data = await this.sendGraphQL(query, { titleSlug });
      const difficulty = data?.question?.difficulty?.toUpperCase() || 'UNRATED';
      const tags = (data?.question?.topicTags || []).map((t) => t.name);
      const details = { difficulty, tags };
      this.questionCache.set(titleSlug, details);
      return details;
    } catch {
      return { difficulty: 'UNRATED', tags: [] };
    }
  }

  /**
   * Fetch question difficulty by titleSlug (cached).
   */
  static async getQuestionDifficulty(titleSlug) {
    const details = await this.getQuestionDetails(titleSlug);
    return details.difficulty;
  }

  /**
   * Fetch recent Accepted (AC) submissions for a user with language, difficulty, and tags.
   * @param {string} username - LeetCode username
   * @param {number} limit - Number of submissions to fetch (up to 50)
   */
  static async getRecentSubmissions(username, limit = 50) {
    const query = `
      query recentSubmissionsWithDetails($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
        }
        recentSubmissionList(username: $username) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `;

    const data = await this.sendGraphQL(query, { username, limit });
    const acList = data?.recentAcSubmissionList || [];
    const allRecent = data?.recentSubmissionList || [];

    // Map language from recentSubmissionList by slug & timestamp
    const langMap = new Map();
    for (const sub of allRecent) {
      if (sub.lang) {
        langMap.set(`${sub.titleSlug}_${sub.timestamp}`, sub.lang);
        langMap.set(`ts_${sub.timestamp}`, sub.lang);
        if (!langMap.has(`slug_${sub.titleSlug}`)) {
          langMap.set(`slug_${sub.titleSlug}`, sub.lang);
        }
      }
    }

    // Resolve question details for unique problem slugs
    const uniqueSlugs = [...new Set(acList.map((s) => s.titleSlug).filter(Boolean))];
    await Promise.all(uniqueSlugs.map((slug) => this.getQuestionDetails(slug)));

    return acList.map((sub) => {
      const lang =
        langMap.get(`${sub.titleSlug}_${sub.timestamp}`) ||
        langMap.get(`ts_${sub.timestamp}`) ||
        langMap.get(`slug_${sub.titleSlug}`) ||
        '';

      const details = this.questionCache.get(sub.titleSlug) || { difficulty: 'UNRATED', tags: [] };

      return {
        ...sub,
        lang,
        difficulty: details.difficulty,
        tags: details.tags,
      };
    });
  }

  /**
   * Fetch contest ranking, rating, and contest history for a user.
   * @param {string} username - LeetCode username
   */
  static async getContestRanking(username) {
    const query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        userContestRankingHistory(username: $username) {
          attended
          trendDirection
          problemsSolved
          totalProblems
          finishTimeInSeconds
          rating
          ranking
          contest {
            title
            startTime
          }
        }
      }
    `;

    const data = await this.sendGraphQL(query, { username }, 'userContestRankingInfo');

    return {
      userContestRanking: data?.userContestRanking || null,
      userContestRankingHistory: data?.userContestRankingHistory || [],
      rating: data?.userContestRanking?.rating ? Math.round(data.userContestRanking.rating) : null,
      globalRanking: data?.userContestRanking?.globalRanking ?? null,
      totalParticipants: data?.userContestRanking?.totalParticipants ?? null,
      topPercentage: data?.userContestRanking?.topPercentage ?? null,
      attendedContestsCount: data?.userContestRanking?.attendedContestsCount ?? 0,
      badge: data?.userContestRanking?.badge?.name ?? null,
    };
  }
}

export default LeetCodeService;