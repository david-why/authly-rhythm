const CDN_TOKEN = process.env.CDN_TOKEN

export async function uploadToCdn(url: string): Promise<string> {
  if (!CDN_TOKEN) throw new Error('CDN token missing')
  const res = await fetch('https://cdn.hackclub.com/api/v3/new', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CDN_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([url]),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error('Upload to CDN failed:', text)
    throw new Error('Upload to CDN failed')
  }
  const data = (await res.json()) as CDNUploadResponse
  return data.files[0]!.deployedUrl
}

interface CDNUploadResponse {
  files: {
    deployedUrl: string
    file: string
    sha: string
    size: number
  }[]
  cdnBase: string
}
