import React, { useState, useRef } from "react";
import axios from "axios";

export default function FindComputerLaps() {
  const [computer, setComputer] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleSearch = async () => {
    const sam = computer.trim();
    if (!sam) {
      setError("Veuillez saisir un nom d'ordinateur.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/ad/computers/get-laps-password", { sam });
      if (res.data?.success) {
        const pwd = typeof res.data.laps_password === "string"
          ? res.data.laps_password
          : JSON.stringify(res.data.laps_password);

        setRows(prev => [{ sam, laps_password: pwd }, ...prev.filter(r => r.sam !== sam)]);
        setComputer("");
        inputRef.current?.focus();
      } else {
        setError(res.data?.message || "Aucun mot de passe LAPS trouvé.");
      }
    } catch (e) {
      setError("Erreur serveur lors de la récupération du LAPS.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={{ maxWidth: 760, margin: "20px auto" }}>
      <h2>Recherche Ordinateur (AD) — LAPS</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={computer}
          onChange={e => setComputer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Saisir SamAccountName ou nom de l'ordinateur..."
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ padding: 8, borderRadius: 6, border: "none", background: "#2563eb", color: "#fff" }}
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            <th style={{ padding: 10, textAlign: "left" }}>Ordinateur</th>
            <th style={{ padding: 10, textAlign: "left" }}>Mot de passe LAPS</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                Aucune donnée — saisissez un ordinateur et cliquez sur « Rechercher »
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ padding: 10 }}>{r.sam}</td>
                <td style={{ padding: 10, fontFamily: "monospace" }}>{r.laps_password}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
