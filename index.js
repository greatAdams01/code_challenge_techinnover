const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// In-memory data store for events
const events = [];

// POST endpoint for ingesting events
app.post('/analytics', (req, res) => {
  const ingestedCount = req.body.reduce((count, event) => {
    event.date = new Date();
    if (isValidEvent(event)) {
      event.id = events.length + 1;
      events.push(event);
      count++;  
    }
    return count;
  }, 0);
  res.status(201).json({ ingested: ingestedCount });
});

// GET endpoint for retrieving all events
app.get('/analytics', (req, res) => {
  res.status(200).json(events);
});

// Helper function to validate events against criteria
function isValidEvent(event) {
  if (event.eventType === 'click') {
    // Filter click events by user
    const userEvents = events.filter(e => e.user === event.user && e.eventType === 'click');
    // get the last event
    if(userEvents.length > 0) {

      const lastEvent = userEvents[userEvents.length - 1];
      if(event.date - lastEvent.date < 3000) {
        return false;
      }
      return true;
    }
    return true
  }
  if (event.eventType === 'pageView') {
    // Filter pageView events by user
    const userEvents = events.filter(e => e.user === event.user && e.eventType === 'pageView');
    // get the last event
    if(userEvents.length > 0) {

      const lastEvent = userEvents[userEvents.length - 1];
      if(event.date - lastEvent.date < 5000) {
        return false;
      }
    }
    return true;
  }
  return false
}

// Start the server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
