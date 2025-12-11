import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import dotenv from 'dotenv'

dotenv.config()

const client = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION 
})


export async function invokeBedrockLLM(intent) {
    const model = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2'
    const command = new InvokeModelCommand({
        modelId: model,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(intent)
    })

    console.log('command sent: ', command)

    const response = await client.send(command)
    console.log('resp: ', response)
    const parsed = JSON.parse(new TextDecoder().decode(response.body))
    console.log('output: ', parsed)

    return parsed.ouput ?? parsed.generated_text ?? parsed.text ?? parsed
}