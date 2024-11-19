import { Firestore } from "@google-cloud/firestore";

import { PROJECT_ID } from "./constants.js";

export const db = new Firestore({ projectId: PROJECT_ID, databaseId: "robeats-cs" });