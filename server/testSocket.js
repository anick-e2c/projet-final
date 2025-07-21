import { io as Client } from "socket.io-client";

// Remplacez par l'URL de votre serveur Socket.IO
const SERVER_URL = "http://localhost:5000";

// Simule un utilisateur connecté (ajustez selon votre logique d'authentification)
const userToken = "aklive-chat-secret-key-2024-production"; // à adapter si besoin

const socket = Client(SERVER_URL, {
  auth: {
    token: userToken
  }
});

socket.on("connect", () => {
  console.log("🟢 Connecté au serveur Socket.IO :", socket.id);

  // Test : rejoindre une salle
  socket.emit("join-room", "1");

  // Test : envoyer un message
  socket.emit("send-message", {
    content: "Ceci est un message de test",
    roomId: "1"
  });

  // Test : indiquer qu'on écrit
  socket.emit("typing-start", { roomId: "1" });
});

socket.on("new-message", (msg) => {
  console.log("📩 Nouveau message reçu :", msg);
});

socket.on("user-joined", (data) => {
  console.log("👤 Un utilisateur a rejoint la salle :", data);
});

socket.on("user-typing", (data) => {
  console.log("✍️ Un utilisateur écrit :", data);
});

socket.on("error", (err) => {
  console.error("❌ Erreur reçue :", err);
});

socket.on("disconnect", () => {
  console.log("🔴 Déconnecté du serveur Socket.IO");
});