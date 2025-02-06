const dotenv = require("dotenv");
const Sequelize = require("sequelize");
const UserModel = require("../../models/UserModel");
const TokenModel = require("../../models/TokenModel");
const TagModel = require("../../models/TagModel");
const ProductModel = require("../../models/ProductModel");
const QuestionModel = require("../../models/QuestionModel");
const ArticleModel = require("../../models/ArticleModel");
const VerifyModel = require("../../models/VerifyModel");
const CompanyModel = require("../../models/CompanyModel");
const CategoryModel = require("../../models/CategoryModel");
const QuestionReplyModel = require("../../models/QuestionReplyModel");
const ForgotPasswordModel = require("../../models/ForgotPasswordModel");
const QuestionUpvotesModel = require("../../models/QuestionUpvotesModel");
const PopularQuestionModel = require("../../models/PopularQuestionsModel");
const LanguageModel = require("../../models/LanguageModel");
const TimeZoneModel = require("../../models/TimeZoneModel");
const QuestionTagModel = require("../../models/QuestionTagModel");
const logger = require("../../config/logger/logger.config");
const ArticleTagModel = require("../../models/ArticleTagModel");
const ArticleUpvotesModel = require("../../models/ArticleUpvotesModel");
const GroupModel = require("../../models/GroupModel");
const UserGroupModel = require("../../models/UserGroupModel");
const ModuleModel = require("../../models/ModuleModel");
const ModuleRightsModel = require("../../models/ModuleRightsModel");
const ModuleOperationRightsModel = require("../../models/ModuleOperationRightsModel");
const IconModel = require("../../models/IconModel");
const UserNotificationModel = require("../../models/UserNotificationTokenModel");
const OperationTypeModel = require("../../models/OperationTypeModel");
const NotificationModel = require("../../models/NotificationModel");
const EntityModel = require("../../models/EntityModel");
const SavedQuestionsModel = require("../../models/SavedQuestionsModel");
const TemplateModel = require("../../models/TemplateModel");
const TemplateTypeModel = require("../../models/TemplateTypeModel");
const VariableModel = require("../../models/VariableModel");
dotenv.config(); // Load environment variables from .env file

// Create a new Sequelize with your MySQL connection details
const sequelize = new Sequelize({
  database: process.env.MYSQL_DATABASE,
  port: process.env.W_MYSQL_DBPORT,
  replication: {
    read: [
      {
        port: process.env.R_MYSQL_DBPORT,
        host: process.env.R_MYSQL_HOST,
        username: process.env.R_MYSQL_USERNAME,
        password: process.env.R_MYSQL_PASSWORD,
      },
    ],
    write: {
      host: process.env.W_MYSQL_HOST,
      username: process.env.W_MYSQL_USERNAME,
      password: process.env.W_MYSQL_PASSWORD,
    },
  },
  dialect: process.env.MYSQL_DIALECT,
  timezone: process.env.SERVER_TIMEZONE,
  logging: (msg) => logger.info("Query : " + msg),
  logQueryParameters: true,
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// Import and include the User model
const User = UserModel(sequelize, Sequelize);
const Token = TokenModel(sequelize, Sequelize);
const Question = QuestionModel(sequelize, Sequelize);
const Product = ProductModel(sequelize, Sequelize);
const Article = ArticleModel(sequelize, Sequelize);
const Tag = TagModel(sequelize, Sequelize);
const OTP = VerifyModel(sequelize, Sequelize);
const Company = CompanyModel(sequelize, Sequelize);
const Category = CategoryModel(sequelize, Sequelize);
const QuestionReply = QuestionReplyModel(sequelize, Sequelize);
const ForgotPassword = ForgotPasswordModel(sequelize, Sequelize);
const QuestionUpvotes = QuestionUpvotesModel(sequelize, Sequelize);
const PopularQuestion = PopularQuestionModel(sequelize, Sequelize);
const QuestionTag = QuestionTagModel(sequelize, Sequelize);
const Language = LanguageModel(sequelize, Sequelize);
const TimeZone = TimeZoneModel(sequelize, Sequelize);
const ArticleTag = ArticleTagModel(sequelize, Sequelize);
const ArticleUpvotes = ArticleUpvotesModel(sequelize, Sequelize);
const Group = GroupModel(sequelize, Sequelize);
const UserGroup = UserGroupModel(sequelize, Sequelize);
const Module = ModuleModel(sequelize, Sequelize);
const ModuleRights = ModuleRightsModel(sequelize, Sequelize);
const ModuleOperationRights = ModuleOperationRightsModel(sequelize, Sequelize);
const Icon = IconModel(sequelize, Sequelize);
const UserNotification = UserNotificationModel(sequelize, Sequelize);
const OperationType = OperationTypeModel(sequelize, Sequelize);
const Notification = NotificationModel(sequelize, Sequelize);
const Entity = EntityModel(sequelize, Sequelize);
const SavedQuestions = SavedQuestionsModel(sequelize, Sequelize);
const Template = TemplateModel(sequelize, Sequelize);
const TemplateType = TemplateTypeModel(sequelize, Sequelize);
const Variable = VariableModel(sequelize, Sequelize);
// Export Sequelize and the models
Tag.belongsToMany(Article, {
  through: ArticleTag,
  foreignKey: "tag_id",
  otherKey: "article_id",
  as: "articles",
});
Article.belongsToMany(Tag, {
  through: ArticleTag,
  foreignKey: "article_id",
  otherKey: "tag_id",
  as: "tags",
});
Category.hasMany(Article, { foreignKey: "category_id" });
Article.belongsTo(Category, { foreignKey: "category_id" });
const dbconfig = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  models: {
    User: User,
    Token: Token,
    Article: Article,
    OTP: OTP,
    Product: Product,
    Question: Question,
    Company: Company,
    Category: Category,
    QuestionReply: QuestionReply,
    ForgotPassword: ForgotPassword,
    QuestionUpvotes: QuestionUpvotes,
    PopularQuestion: PopularQuestion,
    Language: Language,
    TimeZone: TimeZone,
    QuestionTag: QuestionTag,
    Tag: Tag,
    sequelize: sequelize,
    ArticleTag: ArticleTag,
    Group: Group,
    UserGroup: UserGroup,
    Module: Module,
    ModuleRights: ModuleRights,
    ModuleOperationRights: ModuleOperationRights,
    Sequelize: Sequelize,
    ArticleUpvotes: ArticleUpvotes,
    Icon: Icon,
    UserNotification: UserNotification,
    OperationType: OperationType,
    Notification: Notification,
    Entity: Entity,
    SavedQuestions: SavedQuestions,
    Variable: Variable,
    TemplateType: TemplateType,
    Template: Template,
  },
};

module.exports = dbconfig;
