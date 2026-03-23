// lw-extension.js
const LifeWatcherTicketExtension = {
  name: 'LifeWatcherTicket',
  type: 'response',

  match: ({ trace }) => trace.type === 'lw_ticket_form',

  render: ({ trace, element }) => {
    // Transcript uit de trace payload halen (gevuld door Voiceflow)
    const transcript = trace.payload?.transcript || '';

    const iframe = document.createElement('iframe');
    iframe.src = 'https://stormlifewatcher.github.io/lifewatcher-forms/lifewatcher-ticket-form.html';
    iframe.style.cssText = `
      width: 100%;
      height: 620px;
      border: none;
      border-radius: 12px;
      margin-top: 8px;
      display: block;
    `;

    // Zodra iframe geladen is: stuur transcript toe via postMessage
    iframe.addEventListener('load', () => {
      iframe.contentWindow.postMessage({
        type: 'lw_set_transcript',
        transcript: transcript,
      }, '*');
    });

    element.appendChild(iframe);

    // Luister op het bericht dat het formulier stuurt na verzenden
    function onMessage(event) {
      if (event.data?.type !== 'lw_ticket_submitted') return;

      const payload = event.data.payload;

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: {
          ticket_id:   payload.ticket_id   || '',
          email:       payload.email        || '',
          name:        payload.name         || '',
          serial:      payload.serial       || '',
          category:    payload.category     || '',
          description: payload.description  || '',
        },
      });

      window.removeEventListener('message', onMessage);
    }

    window.addEventListener('message', onMessage);
  },
};

export { LifeWatcherTicketExtension };
