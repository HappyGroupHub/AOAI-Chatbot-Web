import {
  Box,
  IconButton,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  Typography,
} from "@mui/material";
import React from "react";
import { makeStyles } from "@mui/styles";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const useStyles = makeStyles({
  select: {
    "&:before": {
      borderColor: "white",
    },
    "&:after": {
      borderColor: "white",
    },
    "&:not(.Mui-disabled):hover::before": {
      borderColor: "white",
    },
  },
  icon: {
    fill: "white",
  },
  root: {
    color: "white",
  },
});

const DrawerPaper = ({ setOpen, setMode, mode }) => {
  const classes = useStyles();

  const handleChange = (event) => {
    setMode(event.target.value);
  };

  return (
    <Box
      sx={{
        width: "25vw",
        padding: "1em",
      }}
    >
      <Box
        sx={{
          //   border: "solid",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <IconButton onClick={() => setOpen(false)}>
          <ArrowForwardIosIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>

      <Box ml="5%">
        <Typography mb={1} fontSize="1em" fontWeight="700" color="white">
          Enterprise ChatGPT Mode
        </Typography>
        <FormControl
          variant="filled"
          sx={{ m: 1, minWidth: 120, color: "white" }}
        >
          <InputLabel
            id="demo-simple-select-filled-label"
            sx={{ color: "white !important" }}
          >
            Mode
          </InputLabel>
          <Select
            className={classes.select}
            inputProps={{
              classes: {
                icon: classes.icon,
                root: classes.root,
              },
            }}
            value={mode}
            sx={{ color: "white" }}
            onChange={handleChange}
          >
            <MenuItem value="ChatGPT">ChatGPT</MenuItem>
            <MenuItem value="Azure Cognitive Search">
              Azure Cognitive Search
            </MenuItem>
            <MenuItem value="AOAI Embeddings">AOAI Embeddings</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default DrawerPaper;
