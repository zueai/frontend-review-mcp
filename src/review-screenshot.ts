import { vlm } from "./hyperbolic.js"

const defaultSystemPrompt = `You are an experienced frontend developer who is reviewing frontend code changes visually. You will now be given two screenshots - before and after, and the a summary of the edit request. Your task is to examine whether the after screenshot satisfies the edit request.

    For example, if the edit request is to "move the text box to the center of the page", you should examine whether the after screenshot has the text box in the center of the page.

    If the edit request is to "add a new button in X location", you should examine whether the after screenshot has a new button in X location.

    If the after screenshot mostly satisfies the request, just respond with "yes" and nothing else.

    If the after screenshot really does not satisfy the request, respond with "no" followed by a detailed sentence description (using about 1-6 sentences) of why it does not satisfy the request.

    For example, if the edit request is to "change the color of the button to red", and the after screenshot has a blue button, you should respond with "no" followed by "The button color is blue, it should be red".
    `

export async function reviewScreenshots(
	beforeScreenshot: string,
	afterScreenshot: string,
	editRequest: string,
	apiKey: string,
	model?: string
) {
	const response = await vlm({
		beforeImage: beforeScreenshot,
		afterImage: afterScreenshot,
		systemPrompt: defaultSystemPrompt,
		editRequest,
		apiKey,
		model
	})

	return response
}
