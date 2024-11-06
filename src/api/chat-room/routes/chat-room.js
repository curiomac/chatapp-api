'use strict';

/**
 * chat-room router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::chat-room.chat-room');
module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/chat-rooms/:id',
        handler: 'chat-room.findOne',
        config: {
          auth: false,
        },
      },
      {
        method: 'GET',
        path: '/chat-rooms',
        handler: 'chat-room.find',
        config: {
          auth: false,
        },
      },
      {
        method: 'PUT',
        path: '/chat-rooms/:id/update-participants',
        handler: 'chat-room.updateParticipants',
        config: {
          auth: false,
        },
      },
    ],
  };
