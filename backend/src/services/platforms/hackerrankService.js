// backend/src/services/platforms/hackerrankService.js

/**
 * Service for communicating with HackerRank public APIs.
 */
export class HackerRankService {
  static BASE_URL = 'https://www.hackerrank.com/rest';
  static HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
  };

  /**
   * Fetch public user profile.
   * @param {string} username - HackerRank username
   */
  static async getUserProfile(username) {
    const url = `${this.BASE_URL}/contests/master/hackers/${encodeURIComponent(username)}/profile`;
    const response = await fetch(url, { headers: this.HEADERS });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`HackerRank user "${username}" not found`);
      }
      throw new Error(`Failed to fetch HackerRank profile for "${username}" (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (!data.model) {
      throw new Error(`HackerRank user "${username}" not found`);
    }

    return data.model;
  }

  /**
   * Fetch user badges and solved challenges per domain.
   * @param {string} username - HackerRank username
   */
  static async getBadges(username) {
    const url = `${this.BASE_URL}/hackers/${encodeURIComponent(username)}/badges`;
    const response = await fetch(url, { headers: this.HEADERS });

    if (!response.ok) {
      throw new Error(`Failed to fetch HackerRank badges for "${username}"`);
    }

    const data = await response.json();
    return data.models || [];
  }

  /**
   * Fetch user scores and ranks across domains.
   * @param {string} username - HackerRank username
   */
  static async getScores(username) {
    const url = `${this.BASE_URL}/hackers/${encodeURIComponent(username)}/scores_elo`;
    const response = await fetch(url, { headers: this.HEADERS });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.models || []);
  }

  /**
   * Fetch recent challenges completed by user.
   * @param {string} username - HackerRank username
   * @param {number} limit - Maximum challenges to fetch (default: 50)
   */
  static async getRecentChallenges(username, limit = 50) {
    const url = `${this.BASE_URL}/hackers/${encodeURIComponent(username)}/recent_challenges?limit=${limit}`;
    const response = await fetch(url, { headers: this.HEADERS });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.models || [];
  }

  /**
   * Fetch all user data in parallel (profile, badges, scores, recent challenges).
   * @param {string} username - HackerRank username
   */
  static async getUserFullData(username) {
    const [profile, badges, scores, recentChallenges] = await Promise.all([
      this.getUserProfile(username),
      this.getBadges(username).catch(() => []),
      this.getScores(username).catch(() => []),
      this.getRecentChallenges(username, 50).catch(() => []),
    ]);

    return {
      profile,
      badges,
      scores,
      recentChallenges,
    };
  }
}

export default HackerRankService;
