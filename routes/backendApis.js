/**
 * Created by pepelu on 2016/5/4.
 */
var express = require('express');
var router = express.Router();
var controllers = require('../controllers');
var path = require('path');
var middleware = require('../middlewares/authentication');

// backend admin APIs
router.get(F.config['manager-url']+'/api/login/', controllers.Manager.process_login);
router.post(F.config['manager-url']+'/api/login/', controllers.Manager.process_login);

//7.manager
router.get(F.config['manager-url']+'/api/dashboard/online/',middleware.backend_auth ,controllers.Manager.json_dashboard_online);
router.get(F.config['manager-url']+'/api/orders/',middleware.backend_auth ,controllers.Manager.json_orders_query);
router.get(F.config['manager-url']+ '/api/orders/:id/',middleware.backend_auth ,controllers.Manager.json_orders_read);
router.get(F.config['manager-url']+ '/api/v2.2/RSC/queryByProducts',middleware.backend_auth ,controllers.Manager.json_RSC_query_by_products);
router.get(F.config['manager-url']+ '/api/backend/users',middleware.backend_auth ,controllers.Manager.json_be_users);
router.put(F.config['manager-url']+ '/api/orders/RSCInfo/',middleware.backend_auth,middleware.auditing_middleware ,controllers.Manager.process_orders_RSCInfo_update);
router.put(F.config['manager-url']+ '/api/orders/subOrders/',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_subOrders_payments_update);
router.put(F.config['manager-url']+  '/api/orders/SKUs/',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_orders_SKUs_update);
router.get(F.config['manager-url']+ '/api/brands/',	middleware.backend_auth,controllers.Manager.json_brands);
router.get(F.config['manager-url']+  '/api/products/',middleware.backend_auth,controllers.Manager.json_products_query);
router.post(F.config['manager-url']+  '/api/products',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_products_save);
router.post(F.config['manager-url']+  '/api/products/updateStatus',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.process_products_updateStatus);
router.post(F.config['manager-url']+ '/api/products/',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_products_remove);
router.get(F.config['manager-url']+ '/api/products/categories/',middleware.backend_auth,controllers.Manager.json_products_categories);
router.get(F.config['manager-url']+ '/api/products/attributes/',middleware.backend_auth,controllers.Manager.json_products_attributes);
router.get(F.config['manager-url']+ '/api/products/:id/',middleware.backend_auth,controllers.Manager.json_products_read);
router.put(F.config['manager-url']+'/api/payrefunds/refundsubmit',middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.json_payrefund_update);
router.get(F.config['manager-url']+'/api/payrefunds/:id', middleware.backend_auth, controllers.Manager.json_payrefund_read);
router.get(F.config['manager-url']+'/api/payrefunds', middleware.backend_auth, controllers.Manager.json_payrefund_query);
router.get(F.config['manager-url']+'/api/v2.2/RSC/orders', middleware.backend_auth, controllers.Manager.json_RSCorders_query);
router.put(F.config['manager-url']+'/api/v2.2/RSC/modify', middleware.backend_auth, controllers.Manager.process_RSC_modify);
router.get(F.config['manager-url']+'/api/v2.2/RSCs', middleware.backend_auth, controllers.Manager.json_RSC_query);
router.get(F.config['manager-url']+'/api/v2.1/potentialCustomer/query', middleware.backend_auth, controllers.Manager.json_potential_customer_query);
router.get(F.config['manager-url']+'/api/v2.1/potentialCustomer/:_id', middleware.backend_auth, controllers.Manager.json_potential_customer_get);
router.post(F.config['manager-url']+'/api/v2.1/SKU/addition/add', middleware.backend_auth, controllers.Manager.process_SKU_Addition_add);
router.get(F.config['manager-url']+'/api/v2.1/SKU/additions', middleware.backend_auth, controllers.Manager.json_SKU_Additions_get);
router.get(F.config['manager-url']+'/api/v2.1/SKU/online/:id', middleware.backend_auth, controllers.Manager.process_SKU_online);
router.get(F.config['manager-url']+'/api/v2.1/SKU/query', middleware.backend_auth, controllers.Manager.json_SKU_get);
router.get(F.config['manager-url']+'/api/v2.1/SKU/attributes', middleware.backend_auth, controllers.Manager.json_SKU_Attributes_get);
router.post(F.config['manager-url']+'/api/v2.1/SKU/attribute/add', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.process_SKU_Attribute_add);
router.post(F.config['manager-url']+'/api/v2.1/SKU/update/:id', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.process_SKU_update);
router.post(F.config['manager-url']+'/api/v2.1/SKU/add', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.process_SKU_add);
router.get(F.config['manager-url']+'/api/businesses', middleware.backend_auth, controllers.Manager.json_businesses);
router.get(F.config['manager-url']+'/api/roles', middleware.backend_auth, controllers.Manager.json_roles);
router.get(F.config['manager-url']+'/api/permissions', middleware.backend_auth, controllers.Manager.json_permissions);
router.post(F.config['manager-url']+'/api/backend/users', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.json_be_users_update);
router.post(F.config['manager-url']+'/api/backend/user/password/modify',middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.process_modify_password);
router.post(F.config['manager-url']+'/api/backend/user/create', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.process_createUser);
router.get(F.config['manager-url']+'/api/auditlogs', middleware.backend_auth, controllers.Manager.json_auditlog_query);
router.get(F.config['manager-url']+'/api/auditlogs/:id', middleware.backend_auth, controllers.Manager.json_auditlog_read);
router.post(F.config['manager-url']+'/api/news/category', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.json_news_category_replace);
router.get(F.config['manager-url']+'/api/news/categories', middleware.backend_auth, controllers.Manager.json_news_categories);
router.post(F.config['manager-url']+'/api/news', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.json_news_remove);
router.post(F.config['manager-url']+'/api/news/updatestatus', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.json_news_updatestatus);
router.get(F.config['manager-url']+'/api/news/:id', middleware.backend_auth, controllers.Manager.json_news_read);
router.post(F.config['manager-url']+'/api/news', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.json_news_save);
router.get(F.config['manager-url']+'/api/news', middleware.backend_auth, controllers.Manager.json_news_query);
router.post(F.config['manager-url']+'/api/products/attribute/add', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.process_product_attributes_add);
router.get(F.config['manager-url']+'/api/products/attr/:attributeName', middleware.backend_auth, controllers.Manager.json_products_attribute);
router.get(F.config['manager-url']+'/api/order/getOfflinePayType', middleware.backend_auth, controllers.Manager.json_offline_pay_type);
router.get(F.config['manager-url']+'/api/orders/confirmOfflinePay', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.process_order_confirm_OfflinePay);
router.put(F.config['manager-url']+'/api/orders/SKUsDelivery', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.json_orders_SKUs_delivery);
router.put(F.config['manager-url']+'/api/orders/products', middleware.backend_auth, middleware.auditing_middleware, controllers.Manager.json_orders_products_update);
router.post(F.config['manager-url']+'/news/uploadImage', middleware.backend_auth, controllers.Manager.CKEditor_uploadImage);
router.post(F.config['manager-url']+'/products/uploadImage', middleware.backend_auth, controllers.Manager.CKEditor_uploadImage);
router.get(F.config['manager-url']+'/api/area/getProvinceList', middleware.backend_auth, controllers.Manager.json_province_query);
router.post(F.config['manager-url']+'/api/area/getProvinceList', middleware.backend_auth, controllers.Manager.json_province_query);
router.get(F.config['manager-url']+'/api/area/getCityList', middleware.backend_auth, controllers.Manager.json_city_query);
router.post(F.config['manager-url']+'/api/area/getCityList', middleware.backend_auth, controllers.Manager.json_city_query);
router.get(F.config['manager-url']+'/api/area/getCountyList', middleware.backend_auth, controllers.Manager.json_county_query);
router.post(F.config['manager-url']+'/api/area/getCountyList', middleware.backend_auth, controllers.Manager.json_county_query);
router.get(F.config['manager-url']+'/api/area/getTownList', middleware.backend_auth, controllers.Manager.json_town_query);
router.post(F.config['manager-url']+'/api/area/getTownList', middleware.backend_auth, controllers.Manager.json_town_query);
// USERS
router.get(F.config['manager-url']+ '/api/users/',middleware.backend_auth,controllers.Manager.json_users_query);
router.get(F.config['manager-url']+ '/api/users/:id/',middleware.backend_auth,controllers.Manager.json_users_read);
router.put(F.config['manager-url']+ '/api/users/',middleware.backend_auth,middleware.auditing_middleware,controllers.Manager.json_users_save);
// Dashboard
router.get(F.config['manager-url']+'/api/dashboard/getDailyReport', middleware.backend_auth, controllers.Manager.getDailyReport);
router.get(F.config['manager-url']+'/api/dashboard/getWeeklyReport', middleware.backend_auth, controllers.Manager.getWeeklyReport);
router.get(F.config['manager-url']+'/api/dashboard/getStatistic', middleware.backend_auth, controllers.Manager.getStatistic);
router.get(F.config['manager-url']+'/api/dashboard/queryDailyReport', middleware.backend_auth, controllers.Manager.queryDailyReport);
router.get(F.config['manager-url']+'/api/dashboard/queryWeeklyReport', middleware.backend_auth, controllers.Manager.queryWeeklyReport);
router.get(F.config['manager-url']+'/api/dashboard/lastUpdateTime', middleware.backend_auth, controllers.Manager.lastUpdateTime);
router.get(F.config['manager-url']+'/api/dashboard/queryAgentReportYesterday', middleware.backend_auth, controllers.Manager.queryAgentReportYesterday);

// potential customer
router.get(F.config['manager-url']+ '/api/v2.1/agentinfo/:id',middleware.backend_auth,controllers.Manager.json_agent_info_get);

// RSC
router.get(F.config['manager-url']+ '/api/v2.2/RSCInfo/:id',middleware.backend_auth,controllers.Manager.json_RSC_info_get);

module.exports = router;