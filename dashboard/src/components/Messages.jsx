import axios from "axios";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { LiveBadge, useLiveUpdates } from "../live";
import { formatDateTime } from "../utils";

// MongoDB ids start with their creation time (seconds since 1970, hex)
const receivedAt = (id) => new Date(parseInt(id.slice(0, 8), 16) * 1000);

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const { isAuthenticated } = useContext(Context);
  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/message/getall", {
        withCredentials: true,
      });
      setMessages(data.messages);
    } catch (error) {
      console.log(error.response?.data?.message);
    }
  }, []);
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  useLiveUpdates(["messages"], fetchMessages);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  const q = search.trim().toLowerCase();
  const visible = messages.filter(
    (m) =>
      !q ||
      [`${m.firstName} ${m.lastName}`, m.email, m.phone, m.message].some((v) =>
        String(v).toLowerCase().includes(q)
      )
  );

  return (
    <section className="page messages">
      <h1>
        MESSAGES ({messages.length}) <LiveBadge />
      </h1>
      <div className="messages-tools">
        <input
          type="search"
          className="table-search"
          placeholder="Search name, phone, email or text…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="message-list">
        {visible.length > 0 ? (
          visible.map((m) => (
            <article className="message-row" key={m._id}>
              <div className="sender">
                <b>{`${m.firstName} ${m.lastName}`}</b>
                <a href={`tel:${m.phone}`}>{m.phone}</a>
                <a href={`mailto:${m.email}`}>{m.email}</a>
              </div>
              <p className="text">{m.message}</p>
              <time dateTime={receivedAt(m._id).toISOString()}>
                {formatDateTime(receivedAt(m._id))}
              </time>
            </article>
          ))
        ) : (
          <p className="muted">{messages.length ? "No messages match your search." : "No messages yet."}</p>
        )}
      </div>
    </section>
  );
};

export default Messages;
