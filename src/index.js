"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    let interval;
    const io = require("socket.io")(strapi.server.httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      if (interval) clearInterval(interval);
      console.log("User connected");

      interval = setInterval(() => {
        io.emit("serverTime", { time: new Date().getTime() });
      }, 1000);

      socket.on("sendMessage", async (messageData) => {
        try {
          if (!messageData?.data?.isTriggerEvent) {
            await strapi.db.query("api::message.message").create(messageData);
          }
          const populatedMessage = await strapi.db
            .query("api::chat-room.chat-room")
            .findOne({
              where: { id: messageData?.data?.room?.id },
              populate: {
                messages: {
                  populate: {
                    user: {
                      populate: { avatar: true },
                    },
                  },
                },
                participants: true,
                chatRoomImage: true,
              },
            });

          const chatRoomsData = await strapi
            .service("api::chat-room.chat-room")
            .find({
              populate: {
                messages: {
                  populate: {
                    user: {
                      populate: { avatar: true },
                    },
                  },
                },
                participants: true,
                chatRoomImage: true,
              },
            });

          const chatRoomsWithLastMessage = chatRoomsData?.results?.map(
            (room) => {
              const lastMessage = room.messages[room.messages.length - 1];
              return {
                ...room,
                lastMessage: lastMessage ? lastMessage : null,
                messages: [],
              };
            }
          );

          io.emit("newMessage", {
            populatedMessage,
            chatRoomsData: chatRoomsWithLastMessage,
          });
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("errorSendingMessage", {
            message: "Error sending message",
          });
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
        clearInterval(interval);
      });
    });

    strapi.io = io;
  },
};
