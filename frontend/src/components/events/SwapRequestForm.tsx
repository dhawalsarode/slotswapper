import React, { useState } from "react";

interface Props {
  token: string;
  myEventId: string;
  requesteeId: string;
  requesteeEventId: string;
  onComplete: () => void;
}

const SwapRequestForm: React.FC<Props> = ({
  token, myEventId, requesteeId, requesteeEventId, onComplete
}) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    const res = await fetch("http://127.0.0.1:5000/api/requests/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        my_event_id: myEventId,
        requestee_id: requesteeId,
        requestee_event_id: requesteeEventId,
        message,
      }),
    });
    const data = await res.json();
    setResponse(data);
    setLoading(false);
    if (data.success) {
      alert("Swap request submitted successfully!");
      setMessage("");
      onComplete();
    } else {
      alert(`Error: ${data.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Propose Swap</h3>
      <label>
        Message (optional): 
        <input value={message} onChange={e => setMessage(e.target.value)} />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Propose Swap"}
      </button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </form>
  );
};

export default SwapRequestForm;
