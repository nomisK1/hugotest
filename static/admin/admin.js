/**
 * YouTube video ID extractor
 * Supports both raw IDs and various YouTube URL formats
 */
const getYouTubeID = (input) => {
  if (!input || typeof input !== "string") return null;
  const clean = input.trim();
  if (!clean) return null;
  // Direct ID format: 11 alphanumeric characters with dashes/underscores
  if (/^[A-Za-z0-9_-]{11}$/.test(clean)) return clean;
  // Extract from URL patterns
  const match = clean.match(
    /(?:[vi]=|vi\/|\/|%3D)([A-Za-z0-9_-]{11})(?:[&?\s#%"]|$)/
  );
  return match?.[1] || null;
};

/**
 * Date field processor for Hugo taxonomy fields
 * Generates years, months, and days fields from a date string
 */
const processDateFields = (data, dateStr) => {
  if (!dateStr) return data;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return data;

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const fields = {
    years: year.toString(),
    months: `${year}/${month}`,
    days: `${year}/${month}/${day}`,
  };

  // Always update the fields to match the current date
  return data.withMutations((map) => {
    Object.entries(fields).forEach(([k, v]) => map.set(k, v));
  });
};

/**
 * Decap CMS Extensions
 * Initializes YouTube shortcode component and date field automation
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
        hint: "Enter a video ID or full URL",
      },
    ],
    pattern: /{{<\s*youtube\s+([a-zA-Z0-9_-]{11})\s*>}}/,
    fromBlock: (match) => ({ id: match[1] }),
    toBlock: (obj) => `{{< youtube ${getYouTubeID(obj.id)} >}}`,
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

  // Auto-populate date taxonomy fields before publishing
  CMS.registerEventListener({
    name: "prePublish",
    handler: ({ entry }) => {
      const data = entry.get("data");
      return data ? processDateFields(data, data.get("date")) : undefined;
    },
  });

  // Auto-populate date taxonomy fields before saving
  CMS.registerEventListener({
    name: "preSave",
    handler: ({ entry }) => {
      const data = entry.get("data");
      return data ? processDateFields(data, data.get("date")) : undefined;
    },
  });
}
