const dbconfig = require("../config/dbconfig/dbconfigmain.js");
const { Product } = dbconfig.models;
const logger = require("../config/logger/logger.config");

/**
 * @desc Method to create new Product
 * @param {Object} productdata
 */
const createProductService = async (productdata) => {
  logger.info("ProductService : createProductService Reached...........");
  const { product_name, product_key, product_icon_id, companyId, userId } =
    productdata;
  await Product.create({
    product_name: product_name,
    product_key: product_key,
    company_id: companyId,
    created_by: userId,
    product_icon_id: product_icon_id,
  });
  logger.info("ProductService : createProductService End...........");
  return { result: 1 };
};

/**
 * @desc Method to Get All Product Data
 * @param {Object} allproductdata
 */
const getAllProductsService = async (allproductdata) => {
  logger.info("ProductService: getAllProductsService Reached...........");
  const { companyId, offset, limit } = allproductdata

  /// Check if limit and offset are provided
  const intLimit = limit ? parseInt(limit) : null;
  const intOffset = offset ? parseInt(offset) : null;
  let product;
  if (intOffset !== null) {
    // Calculate offset based on page number and page size
    // const setOffset = (page - 1) * pageSize;

    // Retrieve products with pagination
    product = await Product.findAndCountAll({
      where: { company_id: companyId },
      offset: intOffset,
      limit: intLimit,
      order: [["id", "DESC"]]
    });
  } else {
    // Retrieve all products if limit and offset are not provided
    product = await Product.findAndCountAll({
      where: { company_id: companyId },
      order: [["id", "DESC"]],
    });
  }

  logger.info("ProductService: getAllProductsService End...........");
  return { data: product };
};

/**
 * @desc Method to Get Product By Id
 * @param {Object} productbyid
 */
const getProductByIdService = async (productbyid) => {
  logger.info("ProductService : getProductByIdService Reached...........");
  const { productId, companyId } = productbyid;
  const product = await Product.findOne({
    where: { id: productId, company_id: companyId },
  });
  if (product === null) {
    return { data: 0 }
  } else {
    logger.info("ProductService : getProductByIdService End...........");
    return { data: product };
  }
};

/**
 * @desc Method to Edit Product By Id
 * @param {Object} productbyid
 */
const editProductByIdService = async (productbyid) => {
  logger.info("ProductService : editProductByIdService Reached...........");
  const {
    product_name,
    product_key,
    product_icon_id,
    companyId,
    userId,
    productId,
  } = productbyid;
  const existingProduct = await Product.findOne({ where: { id: productId } });

  if (existingProduct === null) {
    return { result: 0 }
  }

  existingProduct.product_name = product_name;
  existingProduct.product_key = product_key;
  existingProduct.product_icon_id = product_icon_id;
  existingProduct.company_id = companyId;
  existingProduct.modified_by = userId;
  existingProduct.modified_date = Date.now();

  await existingProduct.save();
  logger.info("ProductService : editProductById End...........");
  return { result: 1 };
};

/**
 * @desc Method to Delete Product By Id
 * @param {Object} deleteproduct
 */
const deleteProductByIdService = async (deleteproduct) => {
  logger.info("ProductService : deleteProductByIdService Reached...........");
  const { productId, companyId } = deleteproduct;
  const existingProduct = await Product.findOne({
    where: { id: productId, company_id: companyId },
  });

  if (existingProduct === null) {
    return { result: 0 }
  }

  await existingProduct.destroy();
  logger.info("ProductService : deleteProductByIdService Reached...........");
  return { result: 1 };
};

/**
 * @desc Method to Check Duplicate Product Key
 * @param {Object} checkDuplicate
 */
const checkDuplicateProductKeyService = async (checkDuplicate) => {
  logger.info(
    "ProductService : checkDuplicateProductKeyService Reached..........."
  );
  const { product_key, companyId } = checkDuplicate;
  const product = await Product.findAll({
    where: { product_key: product_key, company_id: companyId },
  });
  logger.info(
    "ProductService : checkDuplicateProductKeyService End..........."
  );

  return { data: product };
};

const getProductCountService = async (data) => {
  logger.info("ProductService : getProductCountService Reached...........");
  const { companyId } = data;
  const productCount = await Product.count({
    where: { company_id: companyId },
  });
  logger.info("ProductService : getProductCountService End...........");
  return productCount;
};

module.exports = {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  editProductByIdService,
  deleteProductByIdService,
  checkDuplicateProductKeyService,
  getProductCountService,
};
