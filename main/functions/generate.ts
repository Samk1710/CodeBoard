import Groq from "groq-sdk";

const model = process.env.GROQ_MODEL || process.env.NEXT_PUBLIC_GROQ_MODEL || "deepseek-r1-distill-llama-70b";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
    dangerouslyAllowBrowser: true
});


async function generate(prompt: string): Promise<string> {
    const response = await groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
    });
    const contentWithThoughts = response.choices[0].message.content;
    console.log("Content with thoughts:", contentWithThoughts);
    // const contentWithoutThoughts = contentWithThoughts?.replace(/<think>.*?<\/think>/g, "");
    const hasThinkTag = contentWithThoughts?.includes("</think>");
    const contentWithoutThoughts = hasThinkTag
        ? contentWithThoughts?.split("</think>")[1]?.trim()
        : contentWithThoughts;
    console.log("Content without thoughts:", contentWithoutThoughts);
    return contentWithoutThoughts || contentWithThoughts || "";
}