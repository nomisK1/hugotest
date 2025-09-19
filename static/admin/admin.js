/**
 * Extract the 11-character YouTube video ID from a full URL or raw ID.
 *
 * @param {string} input - YouTube URL or ID string.
 * @returns {string|null} - The extracted video ID, or null if not found.
 */
function getYouTubeID(input) {
  if (!input || typeof input !== "string") return null;

  const cleanInput = input.trim();

  // Directly return if input already looks like a valid YouTube ID
  if (/^[A-Za-z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }

  // Try to extract ID from a YouTube URL
  const match = cleanInput.match(
    /(?:[vi]=|vi\/|\/|%3D)([A-Za-z0-9_-]{11})(?:[&?\s#%"]|$)/
  );

  return match ? match[1] : null;
}

/**
 * Register custom DECAP CMS editor component for YouTube videos.
 * Ensures that the CMS library is available before attempting registration.
 */
if (typeof CMS !== "undefined") {
  CMS.registerEditorComponent({
    id: "youtube",
    label: "YouTube",
    fields: [
      {
        name: "id",
        label: "YouTube Video ID",
        widget: "string",
        hint: "Enter a video ID (11 chars) or full YouTube URL",
      },
    ],

    // Detect shortcode in markdown: {{< youtube VIDEOID >}}
    pattern: /{{<\s*youtube\s*([a-zA-Z0-9_-]{11})\s*>}}/,

    // Convert regex match into structured data
    fromBlock: (match) => ({ id: match[1] }),

    // Convert structured data back into shortcode
    toBlock: (obj) => `{{< youtube ${getYouTubeID(obj.id)} >}}`,

    // Render YouTube video preview inside the CMS editor
    toPreview: (obj) =>
      `<div class="relative pb-[56.25%] bg-black rounded-lg overflow-hidden">
        <iframe 
          title="YouTube Video Preview" 
          src="https://youtube.com/embed/${getYouTubeID(obj.id)}" 
          class="absolute inset-0 w-full h-full border-0" 
          allowfullscreen>
        </iframe>
      </div>`,
  });
}
