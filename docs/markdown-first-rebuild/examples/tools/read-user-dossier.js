export const readUserDossier = {
  name: "read_user_dossier",
  description: "Reads the canonical markdown dossier for a specific user.",
  parameters: {
    type: "object",
    properties: {
      userId: { type: "string", description: "The UUID of the user" }
    },
    required: ["userId"]
  },
  execute: async ({ userId }, { db }) => {
    const dossier = await db.query(
      "SELECT markdown FROM user_dossiers WHERE user_id = $1",
      [userId]
    );
    return dossier.rows[0]?.markdown || "Dossier not found.";
  }
};
