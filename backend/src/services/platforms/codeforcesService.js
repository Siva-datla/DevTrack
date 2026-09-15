// backend/src/services/platforms/codeforcesService.js
/**
 * Service for communicating directly with Codeforces API.
 * Docs: https://codeforces.com/apiHelp
 */
export class CodeforcesService {
  static BASE_URL = 'https://codeforces.com/api';

  /**
   * Fetch public user profile and rating.
   * @param {string} handle - Codeforces username
   */
  static async getUserInfo(handle) {
    const response = await fetch(`${this.BASE_URL}/user.info?handles=${encodeURIComponent(handle)}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.comment || `Codeforces user "${handle}" not found`);
    }

    return data.result[0];
  }

  /**
   * Fetch recent submissions for a handle.
   * @param {string} handle - Codeforces username
   * @param {number} count - Number of submissions to fetch (default: 1000)
   */
  static async getSubmissions(handle, count = 1000) {
    const response = await fetch(`${this.BASE_URL}/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${count}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.comment || `Failed to fetch submissions for "${handle}"`);
    }

    return data.result;
  }

  /**
   * Fetch contest rating history.
   * @param {string} handle - Codeforces username
   */
  static async getRatingHistory(handle) {
    const response = await fetch(`${this.BASE_URL}/user.rating?handle=${encodeURIComponent(handle)}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.comment || `Failed to fetch rating history for "${handle}"`);
    }

    return data.result;
  }
}

export default CodeforcesService;