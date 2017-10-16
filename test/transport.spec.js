var assert = require("assert"); // node.js core module
var OrangeCastTransport = require('../lib/transport').OrangeCastTransport;

var messageToParse =  { "dst":null,
                        "src":null,
                        "type":null,
                        "id":-1,
                        "message":null};

describe('OrangeCastTransport', function(){
    describe('toJSON()', function(){
        it('should return a valid default message', function(){
            var message = new OrangeCastTransport();
            assert.equal('{"dst":null,"src":null,"type":null,"id":-1,"message":null}', message.toJSON());
        })
    });
    describe('parse()', function(){
        it('should throw an EvalError ( invalid key value )', function(){
            var message = new OrangeCastTransport();
            try  { message.parse(JSON.stringify(messageToParse)) }catch (e) { assert.equal(e.name,"RangeError"); }
        })
    });
    describe('parse()', function(){
        required_values = ['dst', 'src','type','id','message'];
        for (var key in required_values) {
            it('should throw a RangeError ( key '+ required_values[key] +' not found )', function () {
                var message = new OrangeCastTransport();
                delete messageToParse[required_values[key]];
                try {message.parse(JSON.stringify(messageToParse))} catch (e) { assert.equal(e.name,"EvalError"); }
            })
        }
    });
    describe('parse()', function(){
        it('should throw an SyntaxError ( invalid Format )', function(){
            var message = new OrangeCastTransport();
            try{ message.parse(JSON.stringify(messageToParse)) }catch (e) { assert.equal(true,e instanceof EvalError);}
        })
    });
});