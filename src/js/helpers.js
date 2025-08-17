// @ts-check
import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

/**
 * Rejects after `s` seconds — used with Promise.race to enforce a request timeout.
 *
 * @param {number} s Timeout in seconds
 * @returns {Promise<never>} Always rejects after `s` seconds
 * @author Dusko Vokic
 */
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second(s)`));
    }, s * 1000);
  });
};

/**
 * Fetch with timeout and optional JSON upload.
 * If `uploadData` is provided, sends a POST with JSON body.
 *
 * @template T
 * @param {string} url Request URL
 * @param {Record<string, unknown>=} uploadData Plain object to JSON-stringify and send (optional)
 * @returns {Promise<T>} Parsed JSON response; throws on non-OK responses or timeout
 * @author Dusko Vokic
 */
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    // Let callers annotate the expected type with <T> if they want
    return /** @type {T} */ (data);
  } catch (err) {
    throw err;
  }
};
