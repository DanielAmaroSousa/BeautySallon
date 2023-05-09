const mongoose = require('mongoose');
const URI = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@bsdev.mh1boqh.mongodb.net/?retryWrites=true&w=majority`;

//mongoose.set('useNewUrlParser', true);
//mongoose.set('useFindAndModify', false);
//mongoose.set('useCreateIndex', true);
//mongoose.set('useUnifiedTopology', true);

mongoose
    .connect(URI)
    .then(() => console.log('DB is Up!'))
    .catch((err) => console.log(err));

//console.log(`${process.env.DB_user}`)