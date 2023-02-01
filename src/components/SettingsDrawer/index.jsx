import { LightMode } from "@mui/icons-material";
import { DarkModeOutlined } from "@mui/icons-material";
import { SettingsBrightness } from "@mui/icons-material";
import { Close } from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React from "react";
import { useContext } from "react";
import { SettingsContext } from "../../contexts/SettingsContext";

export const SettingsDrawer = (props) => {
  const { open, setOpen } = props;
  const { theme, setTheme } = useContext(SettingsContext);

  const toggleDrawer = (state) => {
    return () => {
      setOpen(state);
    };
  };
  const handleChangeThemeMode = (e, theme) => {
    setTheme(theme);
  };
  const Heading = styled(Typography)(({ theme }) => ({
    margin: "20px 0 10px",
    color: theme.palette.grey[600],
    fontWeight: 700,
    fontSize: theme.typography.pxToRem(11),
    textTransform: "uppercase",
    letterSpacing: ".08rem",
  }));
  const IconToggleButton = styled(ToggleButton)({
    display: "flex",
    justifyContent: "center",
    width: "100%",
    "& > *": {
      marginRight: "8px",
    },
  });
  return (
    <Drawer
      anchor="right"
      onClose={toggleDrawer(false)}
      open={open}
      PaperProps={{
        elevation: 0,
        sx: { width: { xs: 310, sm: 360 }, borderRadius: "10px 0px 0px 10px" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="body1" fontWeight="500">
          设置
        </Typography>
        <IconButton color="inherit" onClick={toggleDrawer(false)} edge="end">
          <Close color="primary" fontSize="small" />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ pl: 2, pr: 2 }}>
        <Heading gutterBottom id="settings-mode">
          主题模式
        </Heading>
        <ToggleButtonGroup
          exclusive
          value={theme}
          color="primary"
          onChange={handleChangeThemeMode}
          aria-labelledby="settings-mode"
          fullWidth
        >
          <IconToggleButton
            value="light"
            aria-label="亮色"
            data-ga-event-category="settings"
            data-ga-event-action="light"
          >
            <LightMode fontSize="small" />
            日间
          </IconToggleButton>
          <IconToggleButton
            value="system"
            aria-label="跟随系统"
            data-ga-event-category="settings"
            data-ga-event-action="system"
          >
            <SettingsBrightness fontSize="small" />
            系统
          </IconToggleButton>
          <IconToggleButton
            value="dark"
            aria-label="夜间"
            data-ga-event-category="settings"
            data-ga-event-action="dark"
          >
            <DarkModeOutlined fontSize="small" />
            夜间
          </IconToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Drawer>
  );
};
