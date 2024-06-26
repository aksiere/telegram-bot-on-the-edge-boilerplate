import { Bot, webhookCallback } from 'grammy'
import { neon } from '@neondatabase/serverless'

export default {
	async fetch(req, env, ctx) {
		const { url, method, headers } = req
		const { pathname } = new URL(url)

		if (method === 'POST' && pathname === '/bot' && headers.get('x-telegram-bot-api-secret-token') === env.BOT_SECRET) {
			const bot = new Bot(env.BOT_TOKEN)
			const sql = neon(env.POSTGRES_URL)

			bot.command('start', async (ctx) => {
				await ctx.reply('👋')
			})

			bot.command('sql', async (ctx) => {
				const result = await sql`SELECT * FROM somewhere`
				await ctx.reply(JSON.stringify(result))
			})

			return await webhookCallback(bot, 'cloudflare-mod', { secretToken: env.BOT_SECRET })(req)
		}

		return new Response('hello world!')
	},

	async scheduled(ctrl, env) {
		return new Response('triggers every 30 minutes (*/30 * * * *)')
	}
}
