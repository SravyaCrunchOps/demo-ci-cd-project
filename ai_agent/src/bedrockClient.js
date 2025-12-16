import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'
import dotenv from 'dotenv'

dotenv.config()

const client = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
})


export async function invokeBedrockLLM(intent) {
    const model = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2'
    console.log('mode-id: ', model)
    const command = new ConverseCommand({
        modelId: model,
        contentType: 'application/json',
        accept: 'application/json',
        messages: [{role: 'user', content: [{text: intent}]}],
        system: 'You are a helpful assistant that helps software developers fix their CI/CD pipeline issues.',
        inferenceConfig: {
            maxTokens: 1000,
            temperature: 0.7
        }
    })

    console.log('command sent: ', command)

    const response = await client.send(command)
    console.log('resp: ', response)
    // const parsed = JSON.parse(new TextDecoder().decode(response.body))
    const parsed = response.output?.message?.content?.[0]?.text
    console.log('output: ', parsed)
    return parsed
}