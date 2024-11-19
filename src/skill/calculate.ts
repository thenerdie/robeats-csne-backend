export function calculateSkillRating(ratings: Array<number>) {
    const maxNumOfScores = 25
    let accumulatedRating = 0

    ratings = ratings.slice(0, maxNumOfScores)

    ratings.forEach((item, i) => {
        if (i + 1 <= 10) {
            accumulatedRating += item * 1.5
        } else {
            accumulatedRating += item
        }
    })

    const normalizedRating = Math.floor((100 * accumulatedRating) / 30) / 100

    return normalizedRating
}
