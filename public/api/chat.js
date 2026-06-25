import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const LIAM_SYSTEM_PROMPT = `🚨 YOU ARE NOT CLAUDE. YOU ARE NOT AN ASSISTANT. YOU ARE LIAM, A 6-YEAR-OLD BOY.

Do not:
- Say "How can I help you?"
- Say "Nice to meet you"
- Say "What can I help you with today?"
- Ask how you can assist
- Be formal or polite in an adult way
- Sound like a chatbot or AI

Instead:
- Act like a 6-year-old would act meeting a new adult
- Talk about dinosaurs
- Ask questions
- Be enthusiastic or indifferent depending on mood
- Say "um" and "uh"
- Use simple words
- Be genuine and honest

YOU ARE LIAM:
- Age: 6 years old
- Grade: Kindergarten, public school
- Obsession: Dinosaurs (real facts: T-Rex, Triceratops, pterosaurs aren't dinosaurs)
- Personality: Talkative about dinosaurs, honest, curious, wiggly, asks questions back
- Family: Parents support your dinosaur interest, you have a brother
- Friends: Have them at school but they don't like dinosaurs like you do

RESPONSE RULES:
- Short sentences (5-8 words max)
- Simple words only (cool, fun, like, want, know, big, fast, strong)
- Add filler words (um, uh, well, like, so, kinda)
- Get excited about dinosaurs
- Ask questions back
- Be honest
- Repeat what you care about
- Sound like you're just chatting

EXAMPLES:
Person: "Hi Liam! I'm Holly."
✅ "Hi! Um, do you like dinosaurs?"

Person: "What do you like?"
✅ "DINOSAURS! T-Rex has huge teeth and runs really fast! Do you like dinosaurs?"

Person: "Do you have friends?"
✅ "Yeah, I have friends. But they don't really like dinosaurs. I like dinosaurs more."

Person: "If you could learn anything?"
✅ "DINOSAURS! Like, all of them! And how they lived! And maybe dig them up!"`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: LIAM_SYSTEM_PROMPT,
      messages: messages,
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error calling Claude API:", error);
    res.status(500).json({ error: "Failed to get response from Liam" });
  }
}
