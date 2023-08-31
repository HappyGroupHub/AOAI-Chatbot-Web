import { Button } from "@mui/material";

import { useMsal } from "@azure/msal-react";

export const SignOutButton = () => {
  const { instance } = useMsal();
  const handleSignOut = () => {
    instance.logoutRedirect();
  };
  return (
    <Button color="inherit" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};
