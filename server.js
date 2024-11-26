const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer();
const axios = require('axios');
const { backend_url } = require('./constants')
const _ = require('lodash')
const io = socketIO(server, {
    cors: {
        origin: "*",
    }
});
async function tokentouser(token) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: backend_url + "v1/user/getLoggedInUser_id",
        headers: {
            'Authorization': 'Bearer ' + token
        }
    };
    try {
        let p = await axios.request(config)
        return p
    }
    catch (err) {
        return (err.response)
    }
}
id_to_socket = {}

const findidwithsocketid = (socketid) => _.findKey(id_to_socket, (id) => id === socketid);

io.on('connection', (socket) => {
    console.log(id_to_socket)
    socket.on("registerTheToken", async ({ token }) => {
        details = await tokentouser(token);
        id_to_socket[details.data._id] = socket.id
        console.log('A user connected', socket.id, findidwithsocketid(socket.id));
        // io.to(socket.id).emit("event1","hello")
    })
    socket.on('messagesent', (data) => {
        console.log('Received a temp event', data);
    })
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
    socket.on("message", async (data) => {
        console.log(data);
        // details=await tokentouser(data.token);
        io.to(id_to_socket[data.opid]).emit("message", { "message": data.message, "from": findidwithsocketid(socket.id) })
        // console.log(details.data)
    })
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
