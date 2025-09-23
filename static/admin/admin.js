/**
 * Extract the 11-character YouTube video ID from a URL or raw ID.
 *
 * @param {string} input - YouTube URL or video ID
 * @returns {string|null} - Video ID, or null if invalid
 */
function getYouTubeID(input) {
  if (!input || typeof input !== "string") return null;
  const cleanInput = input.trim();
  // Return directly if already a valid ID
  if (/^[A-Za-z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }
  // Extract ID from YouTube URL
  const match = cleanInput.match(
    /(?:[vi]=|vi\/|\/|%3D)([A-Za-z0-9_-]{11})(?:[&?\s#%"]|$)/
  );
  return match ? match[1] : null;
}

/**
 * Initialize CMS extensions if Decap CMS is available.
 */
if (typeof CMS !== "undefined") {
  // Apply Tailwind CSS to preview pane
  CMS.registerPreviewStyle("/css/build.css");

  // Register Hugo YouTube shortcode editor component
  CMS.registerEditorComponent({
    id: "youtube",
    label: "YouTube",
    // Input field configuration
    fields: [
      {
        name: "id",
        label: "YouTube Video ID",
        widget: "string",
        hint: "Enter a video ID or full URL",
      },
    ],
    // Detect Hugo shortcode in content
    pattern: /{{<\s*youtube\s+([a-zA-Z0-9_-]{11})\s*>}}/,
    // Parse shortcode match into component data
    fromBlock: (match) => ({ id: match[1] }),
    // Generate shortcode from component data
    toBlock: (obj) => `{{< youtube ${getYouTubeID(obj.id)} >}}`,
    // Render responsive preview in the CMS editor
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

  // Pre-save hook: populate year, month, and day from date field
  CMS.registerEventListener({
    name: "preSave",
    handler: ({ entry }) => {
      const data = entry.get("data");
      if (!data) return;

      const dateStr = data.get("date");
      if (!dateStr) return;

      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return;

      // Extract date components
      const year = dt.getFullYear();
      const month = dt.getMonth() + 1;
      const day = dt.getDate();

      // Format date values according to Hugo's expectations
      const yearVal = year.toString();
      const monthVal = `${month.toString().padStart(2, "0")}`;
      const dayVal = `${day.toString().padStart(2, "0")}`;

      // Collect only the fields that need updating
      const updates = {};
      if (!data.get("years")) updates.year = yearVal;
      if (!data.get("months")) updates.month = monthVal;
      if (!data.get("days")) updates.day = dayVal;

      // Skip processing if no updates are required
      if (Object.keys(updates).length === 0) return;

      // Apply all updates in a single batch operation
      return data.withMutations((map) => {
        Object.entries(updates).forEach(([key, value]) => {
          map.set(key, value);
        });
      });
    },
  });
}
