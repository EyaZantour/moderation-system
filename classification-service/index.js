const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.resolve(__dirname, '../proto/classifier.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDef).classifier;

//const badWords = ['idiot', 'ugly', 'bad', 'dumbass' , 'dumb', 'fool'];
const badWords = ['idiot', 'ugly', 'bad', 'dumbass', 'dumb', 'fool', 'stupid'].map(word => word.toLowerCase());

function classify(call, callback) {
  const text = call.request.text.toLowerCase();
  const category = badWords.some(w => text.includes(w)) ? 'inappropriate' : 'clean';
  callback(null, { category });
}

const server = new grpc.Server();
server.addService(proto.Classifier.service, { Classify: classify });

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('gRPC running at port 50051');
  server.start();
});
