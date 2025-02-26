// import dotenv from "dotenv"
const models_fallback_order = [
    "Qwen/Qwen2-VL-72B-Instruct",
    "Qwen/Qwen2-VL-7B-Instruct",
    "meta-llama/Llama-3.2-90B-Vision-Instruct",
    "mistralai/Pixtral-12B-2409"
];
export async function vlm({ beforeImage, afterImage, systemPrompt, editRequest, apiKey, model, mimeType = "image/png" }) {
    let retry_attempt = 0;
    // Create a dynamic fallback order that starts with the specified model (if any)
    // and then includes the default fallback models (without duplicating the specified model)
    const dynamicFallbackOrder = [];
    if (model) {
        // Add the specified model as the first one to try
        dynamicFallbackOrder.push(model);
        // Add the rest of the default models, excluding the specified model if it's in the default list
        for (const defaultModel of models_fallback_order) {
            if (defaultModel !== model) {
                dynamicFallbackOrder.push(defaultModel);
            }
        }
    }
    else {
        // If no model specified, just use the default fallback order
        dynamicFallbackOrder.push(...models_fallback_order);
    }
    // Always use the fallback mechanism with our dynamic order
    while (retry_attempt < dynamicFallbackOrder.length) {
        try {
            const currentModel = dynamicFallbackOrder[retry_attempt];
            return await callModel(currentModel, beforeImage, afterImage, systemPrompt, editRequest, apiKey, mimeType);
        }
        catch (error) {
            console.error(`Error with model ${dynamicFallbackOrder[retry_attempt]}:`, error);
            if (retry_attempt < dynamicFallbackOrder.length - 1) {
                console.log(`Retrying with ${dynamicFallbackOrder[retry_attempt + 1]} model...`);
                retry_attempt++;
            }
            else {
                throw error;
            }
        }
    }
    throw new Error("Max retries reached");
}
// Helper function to call the model API
async function callModel(model, beforeImage, afterImage, systemPrompt, editRequest, apiKey, mimeType = "image/png") {
    // console.log(`Using ${model} model`)
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    const response = await fetch("https://api.hyperbolic.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            messages: [
                {
                    role: model === "meta-llama/Llama-3.2-90B-Vision-Instruct"
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
            temperature: 0.5,
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
