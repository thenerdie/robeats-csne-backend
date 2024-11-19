import express from "express";
const router = express.Router();

import { FieldValue, DocumentReference, DocumentSnapshot } from "@google-cloud/firestore";

import { z } from "zod";

import { validateRequest, filterThrough } from "../validate.js";
import { db } from "../db.js";

import { COLLECTIONS, keys } from "../constants.js";

import { calculateSkillRating } from "../skill/calculate.js";
import { IUser } from "../schemas.js";

type User = z.infer<typeof IUser>;

// Define the score schema
const IScore = z.object({
    rating: z.number(),
    accuracy: z.number(),
    maxCombo: z.number(),
    spread: z.object({
        marvelouses: z.number().int().min(0),
        perfects: z.number().int().min(0),
        greats: z.number().int().min(0),
        goods: z.number().int().min(0),
        bads: z.number().int().min(0),
        misses: z.number().int().min(0),
    }),
    player: z.any(),
    mods: z.array(z.number()).default([]),
    hash: z.string()
});

type Score = z.infer<typeof IScore>;

// Mounted to /scores

// GET /leaderboard - Get the top 50 scores for a song by hash

router.get('/leaderboard/:hash', async (req, res, next) => {
    try {
        const hash = req.params.hash;

        const scoresRef = db.collection(COLLECTIONS.SCORES);
        const querySnapshot = await scoresRef
            .where('hash', '==', hash)
            .orderBy('rating', 'desc')
            .limit(50)
            .get()

        const scores = querySnapshot.docs.map(doc => {
            return doc.data() as Score
        })

        if (scores.length === 0) {
            res.json([]);
            return;
        }

        // Extract unique user references from scores
        const userRefs = Array.from(new Set(scores.map(score => score.player.path))).map(path => db.doc(path));
        // Batch fetch all user documents
        const userSnapshots: DocumentSnapshot[] = await db.getAll(...userRefs);

        // Create a mapping from user ID to user data
        const userMap: Record<string, any> = {};
        userSnapshots.forEach(userSnap => {
            if (userSnap.exists) {
                userMap[userSnap.id] = userSnap.data();
            }
        });

        // Replace player references with actual user data
        const populatedScores = scores.map(score => ({
            ...score,
            player: userMap[score.player.id] || null
        }));

        res.json(populatedScores);
    } catch (error) {
        next(error);
    }
});

// POST / - Submit a score to the leaderboards
router.post('/', validateRequest(IScore), async (req, res, next) => {
    try {
        const scoreInput = req.body as Score;
        const { hash, player } = scoreInput;

        const playerData = player as User;

        // Generate user ID and reference
        const userId = keys.users(playerData.id);
        const userRef: DocumentReference = db.collection(COLLECTIONS.USERS).doc(userId);

        const docId = keys.scores(hash, playerData.id);
        const docRef = db.collection(COLLECTIONS.SCORES).doc(docId);
        const doc = await docRef.get();

        // Prepare the score data with player as a reference
        const filteredScore = filterThrough(IScore, {
            ...scoreInput,
            player: userRef // Store reference instead of raw data
        });

        if (doc.exists) {
            const existingScore = doc.data() as z.infer<typeof IScore>;
            if (scoreInput.rating > existingScore.rating) {
                // Update the score if new rating is higher
                await docRef.update(filteredScore);
                res.send("Score updated: new personal best");
            } else {
                // Ignore if not a personal best
                res.send("Score not updated: not a personal best");
                return;
            }
        } else {
            // Add new score document
            await docRef.set(filteredScore, { merge: true });
            res.send("Score added");
        }

        const topScoresSnapshot = await db.collection(COLLECTIONS.SCORES)
            .where('player', '==', userRef) // Query using the reference
            .orderBy('rating', 'desc')
            .limit(25)
            .get();

        const topScores = topScoresSnapshot.docs.map(doc => doc.data() as z.infer<typeof IScore>);

        const skillRating = calculateSkillRating(topScores.map(score => score.rating));

        const userData = {
            rating: skillRating,
            name: playerData.name,
            id: playerData.id,
            accuracy: 0,
            playCount: FieldValue.increment(1)
        }

        await userRef.set(userData, { merge: true });
    } catch (error) {
        next(error);
    }
});

export default router;
