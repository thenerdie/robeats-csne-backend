export const COLLECTIONS = {
    SETTINGS: "settings",
    SCORES: "scores",
    USERS: "users"
}

export const keys = {
    users: (id: number) => `id_${id}`,
    settings: (id: number) => `id_${id}`,
    scores: (hash: string, playerId: number) => `${hash}_${playerId}`
} as const

export const PROJECT_ID = "robeats-cs-185a1";