const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer();
const axios = require('axios');
const { backend_url } = require('./constants')
const _ = require('lodash')
const io = socketIO(server, {
    cors: {
        origin: "*",  // Allow all origins
        methods: ["GET", "POST"],  // Allow GET and POST requests
        credentials: true  // Allow credentials (if needed)
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
    socket.on("registerTheToken", async ({ token }) => {
        details = await tokentouser(token);
        id_to_socket[details?.data._id] = socket.id
        console.log(id_to_socket)
        // io.to(socket.id).emit("event1","hello")
    })
    socket.on('messagesent', (data) => {
        console.log('Received a temp event', data);
    })
    socket.on('disconnect', () => {
        console.log('user disconnected')
        delete id_to_socket[findidwithsocketid(socket.id)]
        console.log(id_to_socket)
    });
    socket.on("message", async (data) => {
        const payload = {
            message: data.message,
            isSender: false,
            time: data.time,
            _id: data.uid,
            from: data.logged_in_user_id,
            type:"message"
        }
        console.log(socket.id +"   to   "+id_to_socket[data._id])
        io.to(id_to_socket[data._id]).emit("messagesent",payload )
        // console.log(details.data)
    })
    socket.on('adminmessagesent', async (data) => {
        const payload = {
            message: data.message,
            isSender: false,
            time: data.time,
            _id: data.uid,
            from: data.logged_in_user_id,
            type:"message"
        }
        console.log(payload)
        console.log(socket.id +"   to   "+id_to_socket[data._id])
        io.to(id_to_socket['admin']).emit("adminmessagerecieve",payload )
    })
    socket.on('admin', async (data) => {
        id_to_socket['admin']=socket.id
    })
});

const port = 443;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
