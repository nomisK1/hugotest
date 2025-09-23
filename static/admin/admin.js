/**
 * Decap CMS Extensions for Hugo Static Site Generator
 *
 * This file provides custom components and automation for Decap CMS:
 * - YouTube shortcode component with smart URL parsing
 * - Automatic Hugo date taxonomy field population
 *
 * @version 1.0.0
 * @author nameMe
 * @requires DecapCMS
 */

/**
 * Extracts YouTube video ID from various input formats
 *
 * Supports:
 * - Raw video IDs (11 characters)
 * - youtube.com/watch?v=ID
 * - youtu.be/ID
 * - youtube.com/embed/ID
 * - And other YouTube URL variants
 *
 * @param {string} input - Video ID or YouTube URL
 * @returns {string|null} - Extracted video ID or null if invalid
 */
const getYouTubeID = (input) => {
  if (!input || typeof input !== "string") return null;

  const clean = input.trim();
  if (!clean) return null;

  // Match direct video ID format (11 alphanumeric chars with dashes/underscores)
  if (/^[A-Za-z0-9_-]{11}$/.test(clean)) return clean;

  // Extract ID from various YouTube URL patterns
  const urlMatch = clean.match(
    /(?:[vi]=|vi\/|\/|%3D)([A-Za-z0-9_-]{11})(?:[&?\s#%"]|$)/
  );

  return urlMatch?.[1] || null;
};

/**
 * Generates Hugo taxonomy fields from a date value
 *
 * Creates hierarchical date taxonomies for Hugo:
 * - years: "2025"
 * - months: "2025/09"
 * - days: "2025/09/23"
 *
 * These taxonomies enable date-based content organization and filtering
 *
 * @param {Object} data - Immutable data object from Decap CMS
 * @returns {Object} - Updated data object with taxonomy fields
 */
const processDateTaxonomy = (data) => {
  const dateStr = data.get("date");
  if (!dateStr) return data;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return data;

  // Extract date components with zero-padding
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Update taxonomy fields using Hugo's hierarchical format
  return data
    .set("years", `${year.toString()}`)
    .set("months", `${year}/${month}`)
    .set("days", `${year}/${month}/${day}`);
};

/**
 * Initialize Decap CMS Extensions
 *
 * Registers custom components and event listeners when CMS is available
 */
if (typeof CMS !== "undefined") {
  // Load Tailwind styles for preview rendering
  CMS.registerPreviewStyle("/css/build.css");

  // YouTube shortcode editor component
  CMS.registerEditorComponent({
    id: "youtube",
    label: "YouTube",
    fields: [
      {
        name: "id",
        label: "YouTube Video ID",
        widget: "string",
        hint: "Enter any YouTube URL or video ID",
      },
    ],

    // Pattern to match existing YouTube shortcodes in content
    pattern: /{{<\s*youtube\s+([a-zA-Z0-9_-]{11})\s*>}}/,

    // Extract video ID when editing existing shortcode
    fromBlock: (match) => ({ id: match[1] }),

    // Generate Hugo shortcode from component data
    toBlock: (obj) => `{{< youtube ${getYouTubeID(obj.id)} >}}`,

    // Live preview in CMS editor
    toPreview: (obj) => `
      <div class="relative pb-[56.25%] bg-black rounded-lg overflow-hidden">
        <iframe
          title="YouTube Video Preview"
          src="https://youtube.com/embed/${getYouTubeID(obj.id)}"
          class="absolute inset-0 w-full h-full border-0"
          allowfullscreen>
        </iframe>
      </div>`,
  });

  // Automatic Date Taxonomy Population: preSave
  CMS.registerEventListener({
    name: "preSave",
    handler: ({ entry }) => {
      const data = entry.get("data");
      return data ? processDateTaxonomy(data) : data;
    },
  });

  // Automatic Date Taxonomy Population: prePublish
  CMS.registerEventListener({
    name: "prePublish",
    handler: ({ entry }) => {
      const data = entry.get("data");
      return data ? processDateTaxonomy(data) : data;
    },
  });
}
