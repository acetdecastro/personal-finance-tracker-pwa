// Vercel serverless function — wraps the TanStack Start SSR fetch handler.
// All requests not matched by static files in dist/client/ are routed here.
import server from '../dist/server/server.js'

export const config = {
  runtime: 'nodejs22.x',
  supportsResponseStreaming: true,
}

export default server.fetch
