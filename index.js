const http = require('http')
const App = require('./routes/route')
const server = http.createServer(App)

server.listen(1000,()=>{
    console.log("your server is running at http://localhost:1000")
})