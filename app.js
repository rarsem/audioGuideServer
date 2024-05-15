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
//mongoose.connect("mongodb+srv://mcoverymaroc:"+process.env.MONGO_ATLAS_PW+"@cluster0.gnkk5o9.mongodb.net/audioGuideDb?retryWrites=true&w=majority")
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
    'http://audioguidea.s3-website.eu-north-1.amazonaws.com',
    'https://api.mcovery.com',
    'https://api.mcovery.com:3000',
    'https://admin.mcovery.com'
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
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'], // Add other headers as needed
  };
      
app.use(cors(corsOptions));

// Enable CORS for all routes or configure it as needed
// Configure Express to serve static files from the "uploads" directory
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

app.use(bodyParser.json());

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

app.use( '/api/circuits', circuitsRoutes);
app.use('/api/arrets', arretsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/grant-authorization', authorizationRoutes);

//tourist
app.use('/api/tourist', touristRoutes);

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is up and running!');
});

module.exports = app;