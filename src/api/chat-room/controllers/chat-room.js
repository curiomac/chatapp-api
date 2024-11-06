"use strict";

/**
 * chat-room controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::chat-room.chat-room",
  ({ strapi }) => ({
    async find(ctx) {
      const query = {
        populate: {
          messages: {
            populate: {
              user: {
                populate: { avatar: true },
              },
            },
          },
          participants: {
            populate: { avatar: true },
          },
        },
        ...ctx.query,
      };
      const entities = await strapi
        .service("api::chat-room.chat-room")
        .find(query);

      const sanitizedEntities = await this.sanitizeOutput(entities, ctx);

      return this.transformResponse(sanitizedEntities);
    },

    async updateParticipants(ctx) {
      const { id } = ctx.params;
      const { participants } = ctx.request.body;

      if (!participants || !Array.isArray(participants)) {
        return ctx.badRequest(
          "Participants field is required and must be an array."
        );
      }

      try {
        const chatRoom = await strapi.db
          .query("api::chat-room.chat-room")
          .findOne({
            where: { id },
            populate: { participants: true },
          });

        if (!chatRoom) {
          return ctx.notFound("Chat room not found");
        }

        const updatedChatRoom = await strapi.db
          .query("api::chat-room.chat-room")
          .update({
            where: { id },
            data: { participants },
            populate: {
              messages: {
                populate: {
                  user: {
                    populate: { avatar: true },
                  },
                },
              },
              participants: {
                populate: { avatar: true },
              },
            },
          });

        const sanitizedEntity = await this.sanitizeOutput(updatedChatRoom, ctx);
        return this.transformResponse(sanitizedEntity);
      } catch (error) {
        console.error("Error updating participants:", error);
        return ctx.internalServerError(
          "An error occurred while updating participants."
        );
      }
    },
  })
);
