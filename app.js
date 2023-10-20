const path = require('path')
const express = require('express');
const bodyParser =  require('body-parser');
const cors = require('cors')

const mongoose = require('mongoose');

const circuitsRoutes = require("./routes/circuits")
const arretsRoutes = require("./routes/arrets")
const userRoutes = require("./routes/user")
const touristRoutes = require("./routes/tourist")
const authorizationRoutes = require('./routes/authorization')

const app = express();

mongoose.connect("mongodb+srv://mmoud:"+process.env.MONGO_ATLAS_PW+"@atlascluster.vnwyqes.mongodb.net/porjectDb?retryWrites=true&w=majority")
.then(()=>{
        console.log('conntect with mongoDb done!!')
}).catch(() => {
        console.log('connection failed')
})

    const allowedOrigins = [
        'capacitor://localhost',
        'ionic://localhost',
        'http://localhost',
        'http://10.0.2.2',
        'http://192.168.0.122',
        'http://192.168.8.115:8100',
        'http://192.168.234.1:8100',
        'http://localhost:8080',
        'http://localhost:8100',
        'http://localhost:4200',
        'http://192.168.190.1:8100',
        'ionic://localhost:8100',
        'ionic://*.*',
        'ionic://*.*:3000',
        'file://*',
        'http://51.20.53.50:3000',
        'http://audioguidea.s3-website.eu-north-1.amazonaws.com'
      ];
      
      // Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
      const corsOptions = {
        origin: (origin, callback) => {
          if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
          } else {
            callback(new Error('Origin not allowed by CORS'));
          }
        },
      };
      
app.use(cors(corsOptions));

// Enable CORS for all routes or configure it as needed
// Configure Express to serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());
//app.use('/images', express.static(path.join("images")));
//app.use(bodyParser.urlencoded({extended : false}));

app.use((req,res,next) => {
    //console.log(req)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Content-Type, x-requested-with, Content-type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods', 
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    )
    next();
})

app.post('/test', (req, res, err) => {
    console.log(req.body)
    res.json('Successful post')
  })

var fs = require('fs');
var music = './audios/mp3/allthat.mp3'; // filepath
app.get('/', (req, res) => {

var stat = fs.statSync(music);
range = req.headers.range;
var readStream;
// if there is no request about range
if (range !== undefined) {
    // remove 'bytes=' and split the string by '-'
    var parts = range.replace(/bytes=/, "").split("-");

    var partial_start = parts[0];
    var partial_end = parts[1];

    if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
        return res.sendStatus(500);         
    }
    // convert string to integer (start)
    var start = parseInt(partial_start, 10);
    // convert string to integer (end)
    // if partial_end doesn't exist, end equals whole file size - 1
    var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
    // content length
    var content_length = (end - start) + 1;

    res.status(206).header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': content_length,
        'Content-Range': "bytes " + start + "-" + end + "/" + stat.size
    });
    
    // Read the stream of starting & ending part
    readStream = fs.createReadStream(music, {start: start, end: end});
} else {
    res.header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });
    readStream = fs.createReadStream(music);
}
  readStream.pipe(res);
    console.log(readStream)
  //res.json('Hello World')
})

app.use( '/api/circuits', circuitsRoutes);
app.use('/api/arrets', arretsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/grant-authorization', authorizationRoutes);

//tourist
app.use('/api/tourist', touristRoutes);

module.exports = app;