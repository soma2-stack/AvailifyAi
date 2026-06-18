import { NextRequest, NextResponse } from "next/server";
import {
  createLocalIdeas,
  type GeneratorResponse,
  type GeneratorTier,
  type NameIdea,
  toHandle,
} from "@/lib/name-generator";

export const runtime = "nodejs";

type OpenAIResponse = {
  error?: { message?: string };
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

type ModelIdea = Omit<NameIdea, "handle" | "score">;

const NAME_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    ideas: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          tagline: { type: "string" },
          why: { type: "string" },
          style: { type: "string" },
        },
        required: ["name", "tagline", "why", "style"],
      },
    },
  },
  required: ["ideas"],
} as const;

function extractOutputText(response: OpenAIResponse): string | null {
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return null;
}

function sanitizeIdeas(value: unknown): NameIdea[] {
  if (!value || typeof value !== "object") return [];
  const rawIdeas = (value as { ideas?: unknown }).ideas;
  if (!Array.isArray(rawIdeas)) return [];

  const seen = new Set<string>();
  return rawIdeas
    .map((raw, index): NameIdea | null => {
      if (!raw || typeof raw !== "object") return null;
      const item = raw as Partial<ModelIdea>;
      if (
        typeof item.name !== "string" ||
        typeof item.tagline !== "string" ||
        typeof item.why !== "string" ||
        typeof item.style !== "string"
      ) {
        return null;
      }

      const name = item.name.trim().slice(0, 32);
      const handle = toHandle(name);
      if (!handle || seen.has(handle)) return null;
      seen.add(handle);

      return {
        name,
        handle,
        tagline: item.tagline.trim().slice(0, 90),
        why: item.why.trim().slice(0, 180),
        style: item.style.trim().slice(0, 28),
        score: Math.max(78, Math.min(96, 96 - index)),
      };
    })
    .filter((idea): idea is NameIdea => Boolean(idea))
    .slice(0, 10);
}

export async function POST(request: NextRequest) {
  let body: { brief?: unknown; audience?: unknown; tone?: unknown; tier?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  const audience = typeof body.audience === "string" ? body.audience.trim() : "";
  const tone = typeof body.tone === "string" ? body.tone.trim() : "Modern";
  const tier: GeneratorTier = body.tier === "pro" ? "pro" : "free";

  if (brief.length < 12 || brief.length > 500) {
    return NextResponse.json(
      { error: "Describe the business in 12 to 500 characters." },
      { status: 400 }
    );
  }

  if (tier === "free") {
    const response: GeneratorResponse = {
      ideas: createLocalIdeas(brief, "free"),
      tier,
      source: "starter",
    };
    return NextResponse.json(response);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const response: GeneratorResponse = {
      ideas: createLocalIdeas(brief, "pro"),
      tier,
      source: "fallback",
    };
    return NextResponse.json(response);
  }

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_NAME_MODEL || "gpt-5.5",
        instructions:
          "You are an elite brand strategist. Create exactly 10 distinct, polished business names. Names must be easy to say, easy to spell, visually strong, and plausible as social handles. Avoid trademark claims, forced misspellings, generic filler, and names that are too close to famous brands. Give concise, useful reasoning. Output only the requested schema.",
        input: `Business brief: ${brief}\nAudience: ${audience || "Not specified"}\nPreferred tone: ${tone}`,
        reasoning: { effort: "low" },
        max_output_tokens: 1800,
        text: {
          verbosity: "low",
          format: {
            type: "json_schema",
            name: "business_name_ideas",
            strict: true,
            schema: NAME_SCHEMA,
          },
        },
      }),
    });

    const data = (await openAIResponse.json()) as OpenAIResponse;
    if (!openAIResponse.ok) {
      throw new Error(data.error?.message || "Name generation failed.");
    }

    const outputText = extractOutputText(data);
    const ideas = outputText ? sanitizeIdeas(JSON.parse(outputText)) : [];
    if (ideas.length < 6) throw new Error("The model returned too few usable names.");

    const response: GeneratorResponse = { ideas, tier, source: "ai" };
    return NextResponse.json(response);
  } catch (error) {
    console.error("AI name generation failed", error);
    const response: GeneratorResponse = {
      ideas: createLocalIdeas(brief, "pro"),
      tier,
      source: "fallback",
    };
    return NextResponse.json(response);
  }
}
