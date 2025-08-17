// @ts-check

/**
 * Base URL for the Forkify API.
 *
 * @type {string}
 * @author Dusko Vokic
 */
export const API_URL = 'https://forkify-api.herokuapp.com/api/v2/recipes/';

/**
 * Request timeout threshold.
 *
 * @type {number} Seconds
 * @author Dusko Vokic
 */
export const TIMEOUT_SEC = 10;

/**
 * Number of search results per page.
 *
 * @type {number}
 * @author Dusko Vokic
 */
export const RES_PER_PAGE = 10;

/**
 * API access key (demo/course use).
 *
 * @type {string}
 * @author Dusko Vokic
 * @todo Move to an environment variable for production builds
 */
export const KEY = 'f0016960-b1a1-4dd8-8684-478e69eaa38e';

/**
 * Delay before closing modal after success.
 *
 * @type {number} Seconds
 * @author Dusko Vokic
 */
export const MODAL_CLOSE_SEC = 2.5;
