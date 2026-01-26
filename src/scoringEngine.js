import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

/**
 * Calculate scores for an event and update all affected leagues
 * @param {string} eventId - The event to score
 * @param {Array} matches - Array of match objects with winners and multipliers
 * @returns {Promise<{usersScored: number, scores: Object}>}
 */
export async function calculateAndUpdateScores(eventId, matches) {
  console.log(`Scoring event: ${eventId}`);

  // 1. Get all picks for this event
  const picksRef = collection(db, "events", eventId, "picks");
  const picksSnap = await getDocs(picksRef);

  // 2. Calculate scores for each user
  const userScores = {}; // { userId: { points, correctPicks, totalPicks } }

  picksSnap.forEach(pickDoc => {
    const pickData = pickDoc.data();
    const userId = pickData.userId;

    // Skip legacy picks (version 1 or no version)
    if (!pickData.version || pickData.version !== 2) {
      console.warn(`Skipping legacy picks for user ${userId}`);
      return;
    }

    let userPoints = 0;
    let correctCount = 0;

    // Calculate points for each match
    matches.forEach(match => {
      const userChoice = pickData.choices[match.matchId];

      if (!userChoice || !match.winner) return;

      // Check if prediction was correct
      if (userChoice.winner === match.winner) {
        const confidence = userChoice.confidence || 0;
        const multiplier = match.multiplier || 1.0;
        const matchPoints = confidence * multiplier;

        userPoints += matchPoints;
        correctCount++;
      }
    });

    userScores[userId] = {
      points: Math.round(userPoints * 100) / 100, // Round to 2 decimals
      correctPicks: correctCount,
      totalPicks: matches.length
    };
  });

  // 3. Get all unique users and their leagues
  const userIds = Object.keys(userScores);

  console.log(`Calculated scores for ${userIds.length} users`);

  // 4. Update each user's league memberships
  let batch = writeBatch(db);
  let updateCount = 0;
  let totalUpdates = 0;

  for (const userId of userIds) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn(`User ${userId} not found, skipping`);
      continue;
    }

    const userData = userSnap.data();
    const leagueIds = userData.leagues || [];

    // Update each league this user is in
    for (const leagueId of leagueIds) {
      const memberRef = doc(db, "leagues", leagueId, "members", userId);
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        console.warn(`Member ${userId} not found in league ${leagueId}, skipping`);
        continue;
      }

      const memberData = memberSnap.data();
      const currentTotal = memberData.totalPoints || 0;
      const eventScores = memberData.eventScores || {};

      // Check if already scored this event for this league member
      if (eventScores[eventId]?.scored) {
        console.warn(`Already scored ${eventId} for user ${userId} in league ${leagueId}, skipping`);
        continue;
      }

      // Add this event's points to total
      const newEventScore = {
        points: userScores[userId].points,
        correctPicks: userScores[userId].correctPicks,
        totalPicks: userScores[userId].totalPicks,
        scored: true,
        scoredAt: serverTimestamp()
      };

      batch.update(memberRef, {
        totalPoints: currentTotal + userScores[userId].points,
        [`eventScores.${eventId}`]: newEventScore
      });

      updateCount++;
      totalUpdates++;

      // Firestore batch limit is 500 operations
      if (updateCount >= 450) {
        console.log(`Committing batch of ${updateCount} updates...`);
        await batch.commit();
        batch = writeBatch(db);
        updateCount = 0;
      }
    }
  }

  // Commit remaining updates
  if (updateCount > 0) {
    console.log(`Committing final batch of ${updateCount} updates...`);
    await batch.commit();
  }

  console.log(`Scoring complete. Updated ${totalUpdates} league memberships across ${userIds.length} users.`);

  return {
    usersScored: userIds.length,
    totalUpdates,
    scores: userScores
  };
}
