const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://user:pass@cluster0.xxx.mongodb.net/foody?retryWrites=true&w=majority', { useNewUrlParser: true });
// Oh wait, I can just check the backend's .env for the MongoDB URI.
