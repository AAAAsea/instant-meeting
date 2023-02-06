/* eslint-disable react/prop-types */
import * as React from "react";
import {
  Badge,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  DialogActions,
  Modal,
  Slide,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import { useContext } from "react";
import { SocketContext } from "@/contexts/SocketContext";
import { HomeMaxRounded } from "@mui/icons-material";
import { DesktopWindowsOutlined } from "@mui/icons-material";

export const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      // top: 0,
      // left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

export function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" component="div">
          {`${props.value}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function RoomInfoDialog(props) {
  const { handleClose, open, children, title } = props;

  return (
    <Dialog
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      onClose={handleClose}
      open={open}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

export function AlertDialog(props) {
  const { handleClose, open, content, title, handleConfirm, handleCancel } =
    props;

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>取消</Button>
          <Button variant="contained" onClick={handleConfirm} autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export function WindowsDialog(props) {
  const { handleClose, open, title, handleConfirm, handleCancel, windows } =
    props;
  const [currentId, setCurrentId] = useState("");
  const { initMyVideo, videoOpen, videoType } = useContext(SocketContext);

  const handleWindowConfirm = () => {
    initMyVideo({
      type: 0,
      quality: "h",
      open: !videoOpen || videoType,
      sourceId: currentId,
    });
    handleCancel();
  };
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontSize: "1em" }}>
          {title}
        </DialogTitle>
        <DialogContent
          className="beautify-scroll animate__animated animate__fadeIn"
          sx={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "space-around",
            minWidth: "300px",
            minHeight: "200px",
          }}
        >
          {windows.map((window) => (
            <Box
              className="animate__animated animate__fadeIn"
              key={window.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "fit-content",
                height: "fit-content",
                fontSize: ".8em",
              }}
            >
              {window.appIcon && window.appIcon.length ? (
                <Box
                  sx={{
                    display: "flex",
                    gap: "10px",
                    height: "25px",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={URL.createObjectURL(new Blob([window.appIcon]))}
                    style={{
                      height: "100%",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setCurrentId(window.id);
                    }}
                  />
                  <Box
                    sx={{
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {window.name}
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    pl: 1,
                  }}
                >
                  {" "}
                  {window.name}
                </Box>
              )}
              <img
                src={URL.createObjectURL(new Blob([window.thumbnail]))}
                style={{
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: ".2s",
                  borderWidth: "3px",
                  borderStyle: "solid",
                  borderColor:
                    currentId === window.id ? "var(--primary)" : "transparent",
                }}
                onClick={() => {
                  setCurrentId(window.id);
                }}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>取消</Button>
          <Button variant="contained" onClick={handleWindowConfirm} autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
