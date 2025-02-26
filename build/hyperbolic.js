// import dotenv from "dotenv"
const models_fallback_order = [
    "Qwen/Qwen2-VL-72B-Instruct",
    "Qwen/Qwen2-VL-7B-Instruct",
    "meta-llama/Llama-3.2-90B-Vision-Instruct",
    "mistralai/Pixtral-12B-2409"
];
export async function vlm({ beforeImage, afterImage, systemPrompt, editRequest, mimeType = "image/png" }) {
    let retry_attempt = 0;
    const maxRetries = 3;
    while (retry_attempt <= maxRetries) {
        try {
            const model = models_fallback_order[retry_attempt];
            // console.log(`Using ${model} model`)
            // await new Promise((resolve) => setTimeout(resolve, 1000))
            const response = await fetch("https://api.hyperbolic.xyz/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.HYPERBOLIC_API_KEY}`
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: model ===
                                "meta-llama/Llama-3.2-90B-Vision-Instruct"
                                ? "user"
                                : "system",
                            content: [
                                {
                                    type: "text",
                                    text: systemPrompt
                                }
                            ]
                        },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "Before screenshot"
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${mimeType};base64,${beforeImage}`
                                    }
                                }
                            ]
                        },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "After screenshot"
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${mimeType};base64,${afterImage}`
                                    }
                                }
                            ]
                        },
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `Edit request: ${editRequest}`
                                }
                            ]
                        }
                    ],
                    model,
                    max_tokens: 4096,
                    temperature: 0.1,
                    top_p: 0.01,
                    stream: false
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                // console.log(JSON.stringify(errorData, null, 2))
                throw new Error(`Hyperbolic API error: ${JSON.stringify(errorData)}`);
            }
            const data = (await response.json());
            const costPerMillionTokens = model === "mistralai/Pixtral-12B-2409" ||
                model === "Qwen/Qwen2-VL-7B-Instruct"
                ? 0.1
                : 0.4;
            const totalCost = (data.usage.total_tokens / 1_000_000) * costPerMillionTokens;
            // console.log(
            // 	`total tokens: ${data.usage.total_tokens}. total cost = $${totalCost}`
            // )
            return data.choices[0].message.content;
        }
        catch (error) {
            if (retry_attempt < maxRetries) {
                // console.log(
                // 	`Error with ${models_fallback_order[retry_attempt]} model. Retrying with ${models_fallback_order[retry_attempt + 1]} model...`
                // )
                retry_attempt++;
            }
            else {
                throw error;
            }
        }
    }
    throw new Error("Max retries reached");
}
