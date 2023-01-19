import React, { useContext } from "react";
import { Collapse, List, ListItem } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { SocketContext } from "../../contexts/SocketContext";

export const Bullet = (props) => {
  const { messages } = useContext(SocketContext);
  // eslint-disable-next-line react/prop-types
  const { slideOpen } = props;
  return (
    <List
      className="bullet-chat"
      style={{ opacity: slideOpen && tabValue ? "0" : "1" }}
    >
      <TransitionGroup>
        {messages.map((e, index) => (
          <Collapse key={e.time + index + e.id}>
            <ListItem className="bullet-chat-item">
              <span className="bullet-chat-name">{e.name}</span>:
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
