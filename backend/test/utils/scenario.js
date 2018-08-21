'use strict';

var async = require('async');

class Scenario
{
    constructor (supertest, urlTemplate)
    {
        this.supertest = supertest;
        this.authenticatedUser = null;
        this.request = {method: null, urlToCall: null};
        this.expected = {status: null, validateFunctions: []};
        this.dataToSend = null;
        this.urlParams = null;
        this.urlTemplate = urlTemplate;
    }
    get given() {return this;}
    get and() {return this;}
    get when() {return this;}
    get then() {return this;}
    get with() {return this;}
    get expect() {return this;}

    isAuthenticated(user) { this.authenticatedUser = user; return this;}

    _urlFactory(urlParams)
    {
        let url = this.urlTemplate;
        for (let paramName in urlParams)
        {
           url = url.replace(':' + paramName, urlParams[paramName]);
        }
        return url;
    }

    get(urlParams) { this.request = this.supertest.get(this._urlFactory(urlParams)); this.urlParams = urlParams; return this;}
    post(urlParams) { this.request = this.supertest.post(this._urlFactory(urlParams)); this.urlParams = urlParams; return this;}
    put(urlParams) { this.request = this.supertest.put(this._urlFactory(urlParams)); this.urlParams = urlParams; return this;}
    delete(urlParams) { this.request = this.supertest.delete(this._urlFactory(urlParams)); this.urlParams = urlParams; return this;}
    validate(validateFn) { this.expected.validateFunctions.push(validateFn); return this;}
    data(data) { this.dataToSend = JSON.parse(JSON.stringify(data)); return this;}
    getDataToSend()
    {
        return this.dataToSend;
    }
    changeData(obj)
    {
        for (let propName in obj)
        {
            this.dataToSend[propName] = obj[propName];
        }
        return this;
    }
    status(status) { this.expected.status = status; return this;}


    get successStatus() { return this.status(200);}
    get successAddStatus() { return this.status(201);}
    get successUpdateStatus() { return this.status(201);}
    get successDeleteStatus() { return this.status(200);}
    message(message) {return this.validate((response, scenario, nextValidation) => { response.body.should.have.property('message', message); return nextValidation(null, response, scenario);});}

    get unauthorizedStatus()
    {
        this.status(401);
        return this.validate((response, scenario, nextValidation)=>{
            response.body.should.have.property('code', 'UnauthorizedError');
            response.body.should.have.property('message', 'I just dont like you');
            return nextValidation(null, response, scenario);
        });
    }
    get invalidRequest()
    {
        this.status(418);

        return this.validate((response, scenario, nextValidation)=>{
            response.body.should.have.property('code', 'AppError');
            response.body.should.have.property('message', 'Invalid Request');
            return nextValidation(null, response, scenario);
        });
    }
    get forbiddenError()
    {
        this.status(403);

        return this.validate((response, scenario, nextValidation)=>{
            response.body.should.have.property('code', 'ForbiddenError');
            response.body.should.have.property('message', 'I just dont like you');
            return nextValidation(null, response, scenario);
        });
    }

    get resourceNotFound()
    {
        this.status(404);

        return this.validate((response, scenario, nextValidation)=>{
            response.body.should.have.property('code', 'ResourceNotFound');
            response.body.should.have.property('message', 'Resource not found');
            return nextValidation(null, response, scenario);
        });
    }


    invalidData(param, msg, value)
    {
        let that = this;
        this.status(418);
        let validateFunction = (response, scenario, nextValidation) =>
        {
            response.body.should.have.property('code', 'FormError');
            //var scenarioSendData = scenario.getDataToSend(fixtures);
            if (value || value === '' || that.dataToSend !== null)
            {
                var expectedValue = (value || value === '') ?
                                    value :
                                    (that.dataToSend !== null) ? that.dataToSend[param] : null;
                response.body.message.should.containEql({msg: msg, param: param, value: expectedValue});
            }
            else
            {
                response.body.message.should.containEql({msg: msg, param: param});
            }
            return nextValidation(null, response, scenario);
        };
        return this.validate(validateFunction);
    }
    bodyDataEquals(obj)
    {
        let validateFunction = (response, scenario, nextValidation) =>
        {
            for (let propName in obj)
            {
                response.body.data.should.have.property(propName, obj[propName]);
            }
            return nextValidation(null, response, scenario);
        };
        return this.validate(validateFunction);
    }
    bodyDataHaveProperties(arrayOfProperties)
    {
        let validateFunction = (response, scenario, nextValidation) =>
        {
            for (let prop of arrayOfProperties)
            {
                response.body.data.should.have.property(prop);
            }
            return nextValidation(null, response, scenario);
        };
        return this.validate(validateFunction);
    }
    bodyHaveProperties(arrayOfProperties)
    {
        let validateFunction = (response, scenario, nextValidation) =>
        {
            for (let prop of arrayOfProperties)
            {
                response.body.should.have.property(prop);
            }
            return nextValidation(null, response, scenario);
        };
        return this.validate(validateFunction);
    }
    bodyHavePropertyValue(propertyName, expectedValue)
    {
        let validateFunction = (response, scenario, nextValidation) =>
        {
            response.body.should.have.property(propertyName, expectedValue);
            return nextValidation(null, response, scenario);
        };
        return this.validate(validateFunction);
    }
    isBodyDataEmptyArray()
    {
        let validateFunction = (response, scenario, nextValidation) =>
        {
            response.body.data.should.be.instanceof(Array).and.have.lengthOf(0);
            return nextValidation(null, response, scenario);
        };
        return this.validate(validateFunction);
    }
    containsEntities(expectedEntities)
    {
        let validateFunction = (response, scenario, nextValidation) =>
        {
            response.body.data.should.be.instanceof(Array).and.have.lengthOf(expectedEntities.length);
            for (var i = 0; i < expectedEntities.length; i++)
            {
                let doc = (expectedEntities[i].cloneFixture) ? expectedEntities[i].cloneFixture() : expectedEntities[i];
                doc._id = doc._id.toString();
                if (doc.board) {doc.board = doc.board.toString();}
                if (doc.nonce) {doc.nonce = doc.nonce.toString();}
                response.body.data.should.containEql(doc);
            }
            return nextValidation(null, response, scenario);
        };
        return this.validate(validateFunction);
    }

    containsEntity(expectedEntity)
    {
        let validateFunction = (response, scenario, nextValidation) =>
        {
            let doc = (expectedEntity.cloneFixture) ? expectedEntity.cloneFixture() : expectedEntity;
            doc._id = doc._id.toString();
            if (doc.board) {doc.board = doc.board.toString();}
            if (doc.nonce) {doc.nonce = doc.nonce.toString();}
            response.body.data.should.containEql(doc);
            return nextValidation(null, response, scenario);
        };
        return this.validate(validateFunction);
    }

    run(doneCallback)
    {
        var that = this;
        var _runScenario = function(authErr, authResponse)
        {
            if (authErr)
            {
                console.log(authErr);
                doneCallback(authErr);
                return;
            }
            if (authResponse)
            {
                that.request.set('Authorization', 'Bearer ' + authResponse.body.token);
            }
            that.request.send(that.getDataToSend())
            .expect(that.expected.status)
            .end((err, response) =>
            {
                if (err)
                {
                    console.log(err);
                    doneCallback(err);
                    return;
                }
                if (that.expected.validateFunctions.length)
                {
                    let startTask = function(nextTask) { return nextTask(null, response, that);};
                    that.expected.validateFunctions.unshift(startTask);
                    async.waterfall(that.expected.validateFunctions, function(validationException)
                    {
                        doneCallback();
                    });
                }
            });
        };
        if (that.authenticatedUser)
        {
            return that.supertest.post('/auth/login')
                .send(that.authenticatedUser)
                .expect(200)
                .end(_runScenario);
        }
        return _runScenario(null, null);
    }

}
class ScenarioFactory
{
    constructor(supertest)
    {
        this.supertest = supertest;
    }

    create(urlTemplate)
    {
        return new Scenario(this.supertest, urlTemplate);
    }
}
module.exports = (supertest) => new ScenarioFactory(supertest);
