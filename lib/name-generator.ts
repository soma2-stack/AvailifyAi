export type GeneratorTier = "free" | "pro";

export type NameIdea = {
  name: string;
  handle: string;
  tagline: string;
  why: string;
  style: string;
  score: number;
};

export type GeneratorResponse = {
  ideas: NameIdea[];
  tier: GeneratorTier;
  source: "ai" | "starter" | "fallback";
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "app",
  "business",
  "company",
  "for",
  "help",
  "helps",
  "i",
  "in",
  "of",
  "people",
  "that",
  "the",
  "to",
  "want",
  "with",
]);

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function toHandle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
}

function keywordsFromBrief(brief: string): string[] {
  const words = brief
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return Array.from(new Set(words ?? [])).slice(0, 4);
}

function scoreHandle(handle: string, index: number, premium: boolean): number {
  let score = premium ? 88 : 68;
  if (handle.length >= 5 && handle.length <= 12) score += 5;
  if (handle.length > 16) score -= 5;
  return Math.max(58, Math.min(96, score - index));
}

export function createLocalIdeas(
  brief: string,
  tier: GeneratorTier
): NameIdea[] {
  const keywords = keywordsFromBrief(brief);
  const first = titleCase(keywords[0] ?? "Bright");
  const second = titleCase(keywords[1] ?? "Idea");
  const third = titleCase(keywords[2] ?? "Flow");

  const candidates =
    tier === "free"
      ? [
          [`${first}Hub`, "Everything in one place", "A direct starter name based on your main keyword.", "Basic"],
          [`${first}Works`, "Built around your idea", "A familiar business-style variation that is easy to understand.", "Basic"],
          [`Get${first}`, "A simple call to action", "A straightforward option for testing the direction quickly.", "Basic"],
        ]
      : [
          [`${first}${second}`, `A sharper way to ${keywords[0] ?? "build"}`, "Combines the two strongest ideas in the brief into a clear, ownable name.", "Descriptive"],
          [`${first}ly`, "Make the next move feel simple", "Short, friendly, and shaped for a modern digital product.", "Modern"],
          [`${second}ora`, "Turn a useful idea into a memorable brand", "Uses a warm ending to create a more distinctive brand sound.", "Invented"],
          [`${first}Pilot`, "Move from idea to action", "Signals guidance and momentum without being too literal.", "Confident"],
          [`${third}Foundry`, "Where better ideas take shape", "Feels established and works well for a service, studio, or platform.", "Premium"],
          [`Novo${first}`, "A fresh take on the category", "Adds a compact innovation cue while keeping the core concept recognizable.", "Invented"],
          [`${first}North`, "A clearer direction forward", "Creates a dependable, strategic feel suited to a serious company.", "Strategic"],
          [`${second}Mint`, "Fresh thinking, ready to use", "Pairs the benefit with a crisp word that suggests quality and creation.", "Playful"],
          [`${first}Spring`, "Start something with momentum", "Feels optimistic and active while remaining easy to pronounce.", "Friendly"],
          [`${first}Axis`, "Built around what matters", "A compact, technical option with a strong visual identity.", "Technical"],
        ];

  const seen = new Set<string>();
  return candidates
    .map(([name, tagline, why, style], index) => {
      const handle = toHandle(name);
      return {
        name,
        handle,
        tagline,
        why,
        style,
        score: scoreHandle(handle, index, tier === "pro"),
      };
    })
    .filter((idea) => {
      if (!idea.handle || seen.has(idea.handle)) return false;
      seen.add(idea.handle);
      return true;
    })
    .slice(0, tier === "pro" ? 10 : 3);
}
