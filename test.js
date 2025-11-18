import admin from "firebase-admin";
import { readFileSync } from "fs";

// Load service account manually
const serviceAccount = JSON.parse(
  readFileSync("C:/keys/appp-a4708-firebase-adminsdk-fbsvc-856badf7b1.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function testWrite() {
  try {
    await db.collection("test").doc("demo").set({ ok: true });
    console.log("Write successful!");
  } catch (e) {
    console.error("ERROR:", e);
  }
}

testWrite();
