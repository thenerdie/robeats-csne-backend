import express from "express";
const router = express.Router();

import { z } from "zod";

import { validateRequest, filterThrough } from "../validate.js";
import { db } from "../db.js";

import { COLLECTIONS } from "../constants.js";

// Define the score schema
const IScore = z.object({
    rating: z.number(),
    combo: z.number(),
    accuracy: z.number(),
    maxCombo: z.number(),
    marvelous: z.number(),
    perfects: z.number(),
    greats: z.number(),
    goods: z.number(),
    bads: z.number(),
    misses: z.number(),
    player: z.object({
        id: z.number(),
        name: z.string()
    }),
    mods: z.array(z.number()),
    hash: z.string()
});

// Mounted to /scores

// GET /leaderboard - Get the top 50 scores for a song by hash
const ILeaderboardQuery = z.object({
    hash: z.string()
});

router.get('/leaderboard', validateRequest(ILeaderboardQuery), async (req, res, next) => {
    try {
        const { hash } = req.body;

        const scoresRef = db.collection(COLLECTIONS.SCORES);
        const querySnapshot = await scoresRef
            .where('hash', '==', hash)
            .orderBy('rating', 'desc')
            .limit(50)
            .get();

        const scores = querySnapshot.docs.map(doc => doc.data());

        res.json(scores);
    } catch (error) {
        next(error);
    }
});

// POST / - Submit a score to the leaderboards
router.post('/', validateRequest(IScore), async (req, res, next) => {
    try {
        const score = req.body as z.infer<typeof IScore>;

        const { hash, player } = score;
        const docId = `${hash}_${player.id}`;
        const docRef = db.collection(COLLECTIONS.SCORES).doc(docId);
        const doc = await docRef.get();

        const filteredScore = filterThrough(IScore, score);

        if (doc.exists) {
            const existingScore = doc.data() as z.infer<typeof IScore>;
            if (score.rating > existingScore.rating) {
                // Update the score if new rating is higher
                await docRef.update(filteredScore);
                res.send("Score updated: new personal best");
            } else {
                // Ignore if not a personal best
                res.send("Score not updated: not a personal best");
            }
        } else {
            // Add new score document
            await docRef.set(filteredScore);
            res.send("Score added");
        }
    } catch (error) {
        next(error);
    }
});

export default router;
