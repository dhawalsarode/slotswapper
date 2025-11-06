import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Register from "./components/auth/Register";
import LoginForm from "./components/auth/LoginForm";
import CreateEvent from "./components/events/CreateEvent";
import EventList from "./components/events/EventList";
import SwapRequestForm from "./components/events/SwapRequestForm";
import PendingSwaps from "./components/requests/PendingSwaps";

function TabPanel({
  children,
  value,
  index,
}: {
  children?: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") || null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedMyEvent, setSelectedMyEvent] = useState<
    { id: string; userId: string } | null
  >(null);
  const [selectedOtherEvent, setSelectedOtherEvent] = useState<
    { id: string; userId: string } | null
  >(null);

  const [snackbar, setSnackbar] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
    }
  }, [token]);

  const API_BASE_URL = import.meta.env.VITE_API_URL!;
  if (!API_BASE_URL) {
    throw new Error("VITE_API_URL environment variable is not set!");
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.access_token && data.user && data.user.id) {
        setToken(data.access_token);
        localStorage.setItem("user_id", data.user.id);
        setSnackbar({ msg: "Login successful", type: "success" });
        setTabIndex(0);
      } else {
        setSnackbar({ msg: data.message || "Login failed", type: "error" });
      }
    } catch (err) {
      setSnackbar({ msg: "Network/server error", type: "error" });
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.access_token && data.user && data.user.id) {
        setToken(data.access_token);
        localStorage.setItem("user_id", data.user.id);
        setSnackbar({ msg: "Registration successful", type: "success" });
        setTabIndex(0);
      } else {
        setSnackbar({ msg: data.message || "Registration failed", type: "error" });
      }
    } catch (err) {
      setSnackbar({ msg: "Network/server error", type: "error" });
    }
  };

  const handleSwapComplete = () => {
    setSelectedMyEvent(null);
    setSelectedOtherEvent(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  if (!token) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Typography variant="h4" align="center" sx={{ mb: 4 }}>
          Welcome to SlotSwapper
        </Typography>
        <Box sx={{ display: "flex", gap: 4, justifyContent: "center" }}>
          <Register onRegister={handleRegister} />
          <LoginForm onLogin={handleLogin} />
        </Box>
        {snackbar && (
          <Snackbar
            open={true}
            autoHideDuration={3500}
            onClose={() => setSnackbar(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert onClose={() => setSnackbar(null)} severity={snackbar.type} sx={{ width: "100%" }}>
              {snackbar.msg}
            </Alert>
          </Snackbar>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: "primary.main",
          letterSpacing: 2,
          textShadow: "0 1px 4px #e0e8f7",
        }}
      >
        SlotSwapper Dashboard
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" variant="outlined">
          <strong>How to request a slot swap:</strong>
          <br />
          1. Select an event from <b>My Events</b>.
          <br />
          2. Then select an event from <b>Other Events</b>.
          <br />
          3. The swap request form will appear below once both events are selected.
          <br />
          <br />
          <strong>Note:</strong> Both events must be in "SWAPPABLE" status to swap. New events are created with this by default.
        </Alert>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setToken(null);
            setSnackbar({ msg: "Logged out", type: "info" });
          }}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Box>
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="My Events" />
        <Tab label="Other Events" />
        <Tab label="Create Event" />
        <Tab label="Swap Requests" />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
        <EventList
          token={token}
          label="My Events"
          filter="mine"
          refreshKey={refreshKey}
          onSelectEvent={(eventId, userId) => setSelectedMyEvent({ id: eventId, userId })}
        />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <EventList
          token={token}
          label="Other Users' Events"
          filter="others"
          refreshKey={refreshKey}
          onSelectEvent={(eventId, userId) => setSelectedOtherEvent({ id: eventId, userId })}
        />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <CreateEvent token={token} />
      </TabPanel>
      <TabPanel value={tabIndex} index={3}>
        <PendingSwaps token={token} onSwapResolved={handleSwapComplete} />
      </TabPanel>
      <Paper sx={{ p: 3, mt: 3 }}>
        {selectedMyEvent && selectedOtherEvent && (
          <SwapRequestForm
            token={token}
            myEventId={selectedMyEvent.id}
            requesteeId={selectedOtherEvent.userId}
            requesteeEventId={selectedOtherEvent.id}
            onComplete={handleSwapComplete}
          />
        )}
      </Paper>
      {snackbar && (
        <Snackbar
          open={true}
          autoHideDuration={3500}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.type} sx={{ width: "100%" }}>
            {snackbar.msg}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default App;
