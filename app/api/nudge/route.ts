export async function POST(req: Request) {
  const { contact, apiKey } = await req.json()

  if (!apiKey) {
    return Response.json({ nudge: 'A good time to reconnect.' }, { status: 200 })
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `You help someone maintain meaningful relationships. Write a warm, specific, actionable reason (2 sentences max) to reach out to this person today. Reference their context and notes. No preamble.

Name: ${contact.name}
Context: ${contact.context}
Notes: ${contact.notes ?? 'None'}
Days since last contact: ${contact.daysSince}
Channel: ${contact.channel}
What this person can offer them: ${contact.offer ?? 'Not specified'}`,
        },
      ],
    }),
  })

  const data = await res.json()
  return Response.json({ nudge: data.content?.[0]?.text ?? 'A good time to reconnect.' })
}
