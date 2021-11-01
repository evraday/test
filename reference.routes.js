process.env.NODE_ENV = "test";

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index');
let should = chai.should();
let mongoose = require('mongoose');
let Request = require('../models/change_request');
let Item = require('../models/item');
let jwt = require('jsonwebtoken');
let temp_data = require('../temporary_data');

var token = jwt.sign({ user: { username: "test" } }, process.env.secret, { expiresIn: '5m' });

chai.use(chaiHttp);

describe('Reference routes', () => {

    before(done => {
        Item.remove()
            .then(temp_data(5))
            .then(done());
    });

    after(done => {
        Request.collection.drop()
            .then(Item.collection.drop())
            .then(done());
    });

    describe('/', () => {
        it('should get all items', done => {
            chai.request(server)
                .get('/')
                .set('X-Access-Token', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.equal(5);
                    done();
                });
        });

    });

    describe('/', () => {
        let item = Item.findOne();
        it('should get one item', done => {
            chai.request(server)
                .get('/' + item._id)
                .set('X-Access-Token', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done();
                });
        });

    });

    describe('/', () => {
        let item = Item.findOne();
        it('should get one item using a tag', done => {
            chai.request(server)
                .get('/' + 'Item0001')
                .set('X-Access-Token', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done();
                });
        });

    });

});