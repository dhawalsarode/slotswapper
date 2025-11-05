import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
} from "@mui/material";

interface Props {
  token: string;
}

const CreateEvent: React.FC<Props> = ({ token }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (new Date(start) >= new Date(end)) {
      setError("End time must be after start time");
      return;
    }
    const res = await fetch("http://127.0.0.1:5000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        start_time: start,
        end_time: end,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setTitle("");
      setStart("");
      setEnd("");
      setSuccess("Event created successfully!");
    } else {
      setError(data.message || "Could not create event");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 480, mb: 3, mx: "auto" }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Create New Event
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Event Title"
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Start Time"
            type="datetime-local"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
            fullWidth
            helperText="Select date and time (e.g., use dropdown for AM/PM)"
          />
          <TextField
            label="End Time"
            type="datetime-local"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            fullWidth
            helperText="E.g., 7:00 AM or 7:00 PM as per dropdown"
          />
          <Button variant="contained" type="submit" size="large" color="primary">
            Create
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default CreateEvent;
