import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function TestFirestore() {
  const [message, setMessage] = useState("initializing...");

  useEffect(() => {
    async function run() {
      try {
        const ref = doc(db, "debug", "hello");
        await setDoc(ref, { text: "WrestleGuess is alive", ts: Date.now() });

        const snap = await getDoc(ref);
        if (snap.exists()) {
          setMessage(snap.data().text);
        } else {
          setMessage("no document found");
        }
      } catch (err) {
        console.error(err);
        setMessage("error: " + err.message);
      }
    }
    run();
  }, []);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0b0b10",
        color: "#fff",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <h2>{message}</h2>
      <p style={{ opacity: 0.7 }}>Firestore connection test</p>
    </div>
  );
}
