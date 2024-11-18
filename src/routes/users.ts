import express from "express";
const router = express.Router();

import { z } from "zod"

import { DocumentSnapshot } from "@google-cloud/firestore";

import { validateRequest, withUpdate, filterThrough } from "../validate.js";
import { IUser, ISettings } from "../schemas.js";

import { db } from "../db.js";

import { COLLECTIONS } from "../constants.js";

const ISettingsQuery = z.object({
    id: z.number()
})

// mounted to /users

router.get('/settings', validateRequest(ISettingsQuery), async (req, res, next) => {
    try {
        const { id } = req.body;
        
        const USER_ID = `id_${id}`

        const user = await db.collection(COLLECTIONS.SETTINGS).doc(USER_ID).get();

        if (!user.exists) {
            res.status(404).send("User not found");
            return;
        }

        res.json(user.data());
    } catch (error) {
        next(error);
    }
});

const ISettingsUpdate = withUpdate(ISettings)

router.put('/settings', validateRequest(ISettingsUpdate), async (req, res) => {
    const settings = req.body as z.infer<typeof ISettingsUpdate>;

    const USER_ID = `id_${settings.id}`

    const docRef = db.collection(COLLECTIONS.SETTINGS).doc(USER_ID)
    const doc = await docRef.get()

    const filteredSettings = filterThrough(ISettings, settings)

    if (doc.exists) {
        await docRef.update(filteredSettings);
    } else {
        await docRef.set(filteredSettings);
    }

    res.send("Settings updated");
});

export default router
