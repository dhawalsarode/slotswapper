import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface Requester {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  start_time: string;
}

interface PendingSwap {
  id: string;
  requester: Requester;
  requester_slot: Event;
  requestee_slot: Event;
  message?: string;
}

interface Props {
  token: string;
  onSwapResolved: () => void;
}

const PendingSwaps: React.FC<Props> = ({ token, onSwapResolved }) => {
  const [swaps, setSwaps] = useState<PendingSwap[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const fetchPendingSwaps = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/requests/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSwaps(data.pending_swaps || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPendingSwaps();
  }, [token]);

  const handleAction = (swapId: string, type: "accept" | "reject") => {
    fetch(`${import.meta.env.VITE_API_URL}/api/requests/${swapId}/${type}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        let msg = data.message || "";
        setSnackbar({ msg: msg, type: msg.includes("successfully") ? "success" : "error" });
        fetchPendingSwaps();
        onSwapResolved();
      });
  };

  return (
    <div style={{ marginTop: 32 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Pending Swap Requests
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : swaps.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
          No pending swap requests
        </Typography>
      ) : (
        <Stack spacing={2}>
          {swaps.map((swap) => (
            <Card key={swap.id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {swap.requester.name} wants to swap:
                </Typography>
                <Typography>
                  <strong>Their event:</strong> {swap.requester_slot.title} ({swap.requester_slot.start_time})
                </Typography>
                <Typography>
                  <strong>Your event:</strong> {swap.requestee_slot.title} ({swap.requestee_slot.start_time})
                </Typography>
                {swap.message && (
                  <Typography sx={{ fontStyle: "italic", color: "text.secondary" }}>
                    Message: {swap.message}
                  </Typography>
                )}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleAction(swap.id, "accept")}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => handleAction(swap.id, "reject")}
                  >
                    Reject
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
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
    </div>
  );
};

export default PendingSwaps;
