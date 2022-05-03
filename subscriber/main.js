import dgram from 'dgram'
import fs from 'fs'

const port = process.env.PORT

const server = dgram.createSocket('udp4')

server.on('error', (err) => {
	console.error("Error starting server: " + err)
})

server.on('message', (buf, rinfo) => {
    const ip = rinfo.address;
	const json = processMessage(buf)
	if (json == null) {
		// There was loss, corruption or unwanted traffic
		console.error(
			"Invalid message: " + buf.toString() + '\t' + "IP: " + ip
		)
		return;
	}
    console.log(`${new Date().toISOString()}\tReceived IP: ${ip}`)

    // Assign ip to nginx
})

server.on('listening', () => {
	const address = server.address()
	console.log(`server listening ${address.address}:${address.port}`)
})

if (!port) {
    console.error(`No port specified`);
    process.exit(-1);
}
server.bind(port)


//**********************************************************
function processMessage(buf) {
	let json;
	if (buf.length > 14) { return null; }	
	try {
		json = JSON.parse(buf.toString('ascii'))	
	} catch (e) {
		return null;
	}
	if (!json?.ping) { return null; }
	return json
}