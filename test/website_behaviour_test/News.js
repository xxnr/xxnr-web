/**
 * Created by pepelu on 2016/6/7.
 */
var Routing = require('./Routing');
require('should-http');
var should = require('should');
var request = require('supertest');
var app = require('../../release');
var models = require('../../models');
var config = require('../../config');
var test_data = require('./test_data');
var deployment = require('../../deployment');
