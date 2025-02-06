const express = require("express");
const cors = require("cors");
const http = require("http");
const https= require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const licenseRoutes = require("./routes/licenseRoutes");
const questionsRoutes = require("./routes/questionRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const articleRoutes = require("./routes/articleRoutes.js");
const jwtAuthentication = require("./middlewares/jwtAuthentication.js");
const productRoutes = require("./routes/productRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js");
const questionUpvotesRoutes = require("./routes/questionUpvotesRoutes.js");
const articleUpvotesRoutes = require("./routes/ArticleUpvotesRoutes.js");
const questionTagsRoutes = require("./routes/QuestionTagRoutes.js");
const userRightsRoutes = require("./routes/userRightsRoutes.js");
const tagRoutes = require("./routes/TagRoutes.js");
const userCommonRoutes = require("./routes/CommonRoutes.js");
const logger = require("./config/logger/logger.config.js");
const path = require("path");
const upload = require("./middlewares/FileUploads.js");
const agmFilter = require("./middlewares/agmFIlter.js");
const {
  checkElasticSearchClusterHealth,
} = require("./service/elsearch/elSearchUtility.js");
const { addLicensedCompanyInRedis } = require("./service/LicenseService.js");
const { initializeData } = require("./controllers/CommonController.js");
const dbconfig = require("./config/dbconfig/dbconfigmain.js");
const questionReplesRoutes = require("./routes/questionReplyRoutes.js");
require("./cron/calculatePopularQuestion");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./swagger/swagger_options.json");
const openAPIRoutes = require("./routes/openApiRoutes.js");
const i18n = require("./config/language/i18.config.js");
const iconRoutes = require("./routes/IconRoutes.js")
const notificationRoutes= require("./routes/NotificationRoutes.js");
const templateRoutes= require("./routes/TemplateRoutes.js");
var serviceAccount = require("./test-push-notification-b3e46-firebase-adminsdk-afr67-257e7f2b1b.json");
var admin = require("firebase-admin");
const app = express();

// Load environment variables from .env file
dotenv.config();

//Http Server
let httpServer;
if (process.env.PROJECT_PROFILE === 'Prod') {
  const privateKey = fs.readFileSync('./certificates/helpnode.key', 'utf8');
  const certificate = fs.readFileSync('./certificates/helpnode.crt', 'utf8');
  const credentials = {
  key: privateKey,
  cert: certificate
  };
  httpServer = https.createServer(credentials, app);
} else {
  httpServer = http.createServer(app);
}

// Enable Cross-Origin Resource Sharing (CORS)

// Define the list of allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://dev.localhost:5173'

];

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}; 
app.use(cors(corsOptions));
 
// Sync Sequelize with the database
dbconfig.sequelize
  .sync({ alter: true })
  .then(() => {
    // Add Initial Data to Database
    initializeData();
    // Add Companies to Redis
    addLicensedCompanyInRedis();
  })
  .catch((error) => {
    console.error("Error syncing Sequelize with the database:", error);
  });

// Elasticsearch Health Check
checkElasticSearchClusterHealth();


//FireBase 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


//Language Integration
app.use(i18n.init);
console.log("language--------------------------------");
console.log(i18n.getLocales()); // ['en', 'uk']
console.log(i18n.getLocale());
console.log("Language %%%%%% ",t('articlesaved'));


// Parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Implement the configuration
const swaggerSpecs = swaggerJSDoc(swaggerOptions);

// Serve Swagger UI
app.use("/swagger/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes to access the api to send email template
app.use("/swagger/api", openAPIRoutes);

// Middleware for Company License
app.use(agmFilter);
// Routes for authentication
app.use("/knowledgebase", authRoutes);

//Routes for Licensing
app.use("/knowledgebase", licenseRoutes);

// Unauthenticated Routes
app.use("/knowledgebase", uploadRoutes);

// Middleware for JWT authentication
app.use(jwtAuthentication);

// Authenticated Routes
app.use("/knowledgebase", userRoutes);
app.use("/knowledgebase", articleRoutes);
app.use("/knowledgebase", productRoutes);
app.use("/knowledgebase", questionsRoutes);
app.use("/knowledgebase", questionReplesRoutes);
app.use("/knowledgebase", categoryRoutes);
app.use("/knowledgebase", dashboardRoutes);
app.use("/knowledgebase", questionUpvotesRoutes);
app.use("/knowledgebase", articleUpvotesRoutes);
app.use("/knowledgebase", tagRoutes);
app.use("/knowledgebase", userCommonRoutes);
app.use("/knowledgebase", questionTagsRoutes);
app.use("/knowledgebase", userRightsRoutes);
app.use("/knowledgebase", iconRoutes);
app.use("/knowledgebase", notificationRoutes);
app.use("/knowledgebase", templateRoutes);
// Start the server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info("Successful! Server is running on port " + PORT)
});
