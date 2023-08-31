import { useState, React } from "react";
import {
  Stack,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";
import DrawerPaper from "./DrawerPaper";
import { useIsAuthenticated } from "@azure/msal-react";
import { WelcomeName } from "./WelcomeName";

export const NavBar = ({ mode, setMode }) => {
  const [open, setOpen] = useState(false);
  const toggleDrawer = (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setOpen(false);
  };
  const isAuthenticated = useIsAuthenticated();

  return (
    <div sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }}>Azure OpenAI Demo</Typography>
          {isAuthenticated ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <WelcomeName />
              <SignOutButton />
              <IconButton onClick={() => setOpen(true)}>
                <ArrowBackIosIcon sx={{ color: "white" }} />
              </IconButton>
            </Stack>
          ) : (
            <SignInButton />
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            backgroundColor: "#5F6466",
            color: "white",
          },
        }}
      >
        <DrawerPaper setOpen={setOpen} mode={mode} setMode={setMode} />
      </Drawer>
    </div>
  );
};
