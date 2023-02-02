import React, { useContext } from "react";
import { Box, Collapse, List, ListItem } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { SocketContext } from "../../contexts/SocketContext";
import "./index.scss";
export const Bullet = (props) => {
  const { messages } = useContext(SocketContext);
  // eslint-disable-next-line react/prop-types
  const { slideOpen, tabValue } = props;
  return (
    <List
      className="bullet-chat"
      style={{ opacity: slideOpen && tabValue ? "0" : "1" }}
    >
      <TransitionGroup>
        {messages.map((e, index) => (
          <Collapse key={e.time + index + e.id}>
            <ListItem
              className="bullet-chat-item"
              sx={{ bgcolor: "background.light" }}
            >
              <Box className="bullet-chat-name" sx={{ color: "primary.main" }}>
                {e.name}
              </Box>
              :
              {e.type === "file" ? (
                <span className="bullet-chat-content">【文件】 {e.msg}</span>
              ) : (
                <span className="bullet-chat-content">{e.msg}</span>
              )}
            </ListItem>
          </Collapse>
        ))}
      </TransitionGroup>
    </List>
  );
};
