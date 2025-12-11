import crypto from 'crypto'

export const verifySignature = async (req, webhook_secret) => {
    if(!webhook_secret) {
        console.log('!!! No webhook secret provided')
        return false
    }
    console.log('requests: ', req)
    console.log('headers: ', req.headers)
    
    const signature = req.headers['x-hub-signature-256']
    console.log('signature: ', signature)
    
    if(!signature) {
        console.log('!!! No signature provided: ', signature)
        return false
    }
    const hmac = crypto.createHmac("sha256", webhook_secret)
    const payload = JSON.stringify(req.body)
    hmac.update(payload)

    const digest = `sha256=${hmac.digest("hex")}`

    const safe_signature = crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
    console.log('safe-signature: ', safe_signature)
    return safe_signature
}