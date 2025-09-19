/**
 * Extracts the 11-character YouTube video ID from a full URL or raw ID.
 * Supports various YouTube URL formats including watch, youtu.be, and embed URLs.
 *
 * @param {string} input - YouTube URL or video ID string
 * @returns {string|null} - The extracted video ID, or null if invalid
 */
function getYouTubeID(input) {
  if (!input || typeof input !== "string") return null;

  const cleanInput = input.trim();

  // Return if input is already a valid YouTube ID
  if (/^[A-Za-z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }

  // Extract ID from YouTube URL using regex pattern
  const match = cleanInput.match(
    /(?:[vi]=|vi\/|\/|%3D)([A-Za-z0-9_-]{11})(?:[&?\s#%"]|$)/
  );

  return match ? match[1] : null;
}

// Initialize CMS component only when CMS library is available
if (typeof CMS !== "undefined") {
  // Load Tailwind CSS for preview styling
  CMS.registerPreviewStyle("/css/build.css");

  // Register YouTube video embed component for content management
  CMS.registerEditorComponent({
    id: "youtube",
    label: "YouTube",

    // Define input field configuration
    fields: [
      {
        name: "id",
        label: "YouTube Video ID",
        widget: "string",
        hint: "Enter a video ID (11 chars) or full YouTube URL",
      },
    ],

    // Pattern to detect Hugo shortcode: {{< youtube VIDEOID >}}
    pattern: /{{<\s*youtube\s+([a-zA-Z0-9_-]{11})\s*>}}/,

    // Parse shortcode match into component data
    fromBlock: (match) => ({ id: match[1] }),

    // Generate shortcode from component data
    toBlock: (obj) => `{{< youtube ${getYouTubeID(obj.id)} >}}`,

    // Render responsive YouTube embed preview in CMS editor
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
