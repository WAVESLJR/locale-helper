// src/routes/api/translate/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const body = await request.json();
        const { base, language, translate } = body;

        // Validate input
        if (!base || !language || !translate) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Here you would implement your translation logic
        // For example, call an external API or merge the JSON
        // This example just echoes back the input for demonstration
        const mergedJson = {
            [translate]: { ...base[language] }
        };

        return json({ mergedJson });

    } catch (err) {
        console.error('Translate API error:', err);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
