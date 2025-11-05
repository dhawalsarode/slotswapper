import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#F5F6FA",
      paper: "#fff",
    },
    primary: {
      main: "#1a73e8",
    },
    secondary: {
      main: "#8e24aa",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

export default theme;
