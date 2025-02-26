// import dotenv from "dotenv"

// import path from "node:path"
// import { fileURLToPath } from "node:url"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// dotenv.config({ path: path.join(__dirname, "..", ".env") })

interface SuccessfulResponse {
	id: string
	object: string
	created: number
	model: string
	choices: {
		index: number
		message: {
			role: string
			content: string
		}
		finish_reason: string
	}[]
	usage: {
		prompt_tokens: number
		completion_tokens: number
		total_tokens: number
	}
}

interface ErrorResponse {
	error: {
		message: string
		type: string
		param: string | null
		code: string | null
	}
}

const models_fallback_order = [
	"Qwen/Qwen2-VL-72B-Instruct",
	"Qwen/Qwen2-VL-7B-Instruct",
	"meta-llama/Llama-3.2-90B-Vision-Instruct",
	"mistralai/Pixtral-12B-2409"
]

export async function vlm({
	beforeImage,
	afterImage,
	systemPrompt,
	editRequest,
	apiKey,
	model,
	mimeType = "image/png"
}: {
	beforeImage: string //base64 encoded image
	afterImage: string //base64 encoded image
	systemPrompt?: string
	editRequest?: string
	apiKey: string
	model?: string
	mimeType?: string
}): Promise<string> {
	let retry_attempt = 0
	const maxRetries = 3

	// If a specific model is provided, use it directly
	if (model) {
		try {
			return await callModel(
				model,
				beforeImage,
				afterImage,
				systemPrompt,
				editRequest,
				apiKey,
				mimeType
			)
		} catch (error) {
			console.error(`Error with specified model ${model}:`, error)
			// Fall back to using the fallback order if the specified model fails
			console.log("Falling back to default model fallback order...")
		}
	}

	// Use fallback order if no model specified or if specified model failed
	while (retry_attempt <= maxRetries) {
		try {
			const fallbackModel = models_fallback_order[retry_attempt]
			return await callModel(
				fallbackModel,
				beforeImage,
				afterImage,
				systemPrompt,
				editRequest,
				apiKey,
				mimeType
			)
		} catch (error) {
			if (retry_attempt < maxRetries) {
				// console.log(
				// 	`Error with ${models_fallback_order[retry_attempt]} model. Retrying with ${models_fallback_order[retry_attempt + 1]} model...`
				// )
				retry_attempt++
			} else {
				throw error
			}
		}
	}

	throw new Error("Max retries reached")
}

// Helper function to call the model API
async function callModel(
	model: string,
	beforeImage: string,
	afterImage: string,
	systemPrompt?: string,
	editRequest?: string,
	apiKey?: string,
	mimeType = "image/png"
): Promise<string> {
	// console.log(`Using ${model} model`)
	// await new Promise((resolve) => setTimeout(resolve, 1000))
	const response = await fetch(
		"https://api.hyperbolic.xyz/v1/chat/completions",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				messages: [
					{
						role:
							model === "meta-llama/Llama-3.2-90B-Vision-Instruct"
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
		}
	)

	if (!response.ok) {
		const errorData = await response.json()
		// console.log(JSON.stringify(errorData, null, 2))
		throw new Error(`Hyperbolic API error: ${JSON.stringify(errorData)}`)
	}

	const data = (await response.json()) as SuccessfulResponse

	const costPerMillionTokens =
		model === "mistralai/Pixtral-12B-2409" ||
		model === "Qwen/Qwen2-VL-7B-Instruct"
			? 0.1
			: 0.4
	const totalCost =
		(data.usage.total_tokens / 1_000_000) * costPerMillionTokens
	// console.log(
	// 	`total tokens: ${data.usage.total_tokens}. total cost = $${totalCost}`
	// )

	return data.choices[0].message.content
}
