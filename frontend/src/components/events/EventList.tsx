import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Box,
} from "@mui/material";

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  user_id: string;
}

interface EventListProps {
  token: string;
  label: string;
  filter: "mine" | "others";
  refreshKey: number;
  onSelectEvent: (id: string, userId: string) => void;
}

const EventList: React.FC<EventListProps> = ({
  token,
  label,
  filter,
  refreshKey,
  onSelectEvent,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey, token]);

  const myUserId = localStorage.getItem("user_id") || "";

  const filteredEvents =
    filter === "mine"
      ? events.filter((ev) => ev.user_id === myUserId)
      : events.filter((ev) => ev.user_id !== myUserId);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ minWidth: 300, paddingY: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        {label}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {filteredEvents.length === 0 ? (
            <Typography color="text.secondary">
              No events available
            </Typography>
          ) : (
            filteredEvents.map((event) => (
              <Card
                key={event.id}
                variant="outlined"
                onClick={() => onSelectEvent(event.id, event.user_id)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 6, backgroundColor: "#F9F9F9" },
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(event.start_time)} – {formatDate(event.end_time)}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}
    </Box>
  );
};

export default EventList;
