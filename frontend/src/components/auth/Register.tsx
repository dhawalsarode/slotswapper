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
  onRegister: (name: string, email: string, password: string) => void;
}

const Register: React.FC<Props> = ({ onRegister }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    onRegister(name, email, password);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Register
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Name"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Confirm Password"
            type="password"
            size="small"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            fullWidth
          />
          <Button variant="contained" color="secondary" type="submit" size="large">
            Register
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default Register;
